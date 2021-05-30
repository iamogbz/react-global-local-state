import * as React from "react";
import * as moment from "moment";
import isEqual from "lodash.isequal";

type MaybeValue<T> = T | undefined;
interface ValueGetter<T> {
  (): MaybeValue<T>;
}

type Valuer<T> = MaybeValue<T> | ValueGetter<T>;
function getValue<T>(valuer: Valuer<T>): MaybeValue<T>;
function getValue(valuer: unknown) {
  if (typeof valuer === "function") return valuer();
  return valuer;
}

type ValueStamper<R> = (...args: never[]) => R;
type Stamp<U> = (U extends ValueStamper<infer R> ? R : number) | number;
function getStamp<T>(stamper: T): Stamp<T> {
  if (typeof stamper === "function") return stamper();
  return moment.now();
}

export interface OnValue<T> {
  (newValue?: T): unknown;
}

interface UpdateableValue<T> {
  value: Valuer<T>;
  setValue: OnValue<T>;
}

interface UseValueOptions<T, U> {
  source?: Partial<UpdateableValue<T>>;
  stamper?: U;
}

interface UseValueResult<T, U> {
  value: MaybeValue<T>;
  setValue: OnValue<T>;
  stamp: Stamp<U>;
}

/**
 * Keep track of set value changes and triggers change handler on difference.
 * Uses {@link lodash.isequal} to compare values when checking for a change.
 */
export function useValue<T, U>({
  source: initial,
  stamper,
}: UseValueOptions<T, U> = {}): UseValueResult<T, U> {
  const [state, setState] = React.useState(() => ({
    value: getValue(initial?.value),
    stamp: getStamp(stamper),
  }));

  const onValueChange = initial?.setValue;
  const setValue: OnValue<T> = React.useCallback(
    function setValue(newValue) {
      if (isEqual(newValue ?? null, state.value ?? null)) return;
      onValueChange?.(newValue);
      return setState({
        value: newValue,
        stamp: getStamp(stamper),
      });
    },
    [onValueChange, setState, stamper, state.value],
  );

  return { ...state, setValue };
}

interface UseTrackedValueOptions<T, U> {
  source: Partial<UseValueResult<T, U>>;
  stamper?: U;
  shouldUpdate: (sourceStamp?: Stamp<U>, targetStamp?: Stamp<U>) => boolean;
}

export function useTrackedValue<T, U>({
  source,
  stamper,
  shouldUpdate,
}: UseTrackedValueOptions<T, U>): UseValueResult<T, U> {
  const tracked = useValue({
    source,
    stamper,
  });

  const trackedSetValue = tracked.setValue;
  const trackedStamp = tracked.stamp;

  // Conditionally update internal tracked value when given source value changes
  React.useEffect(
    function trackValue() {
      if (!shouldUpdate(source.stamp, trackedStamp)) return;
      trackedSetValue(source.value);
    },
    [shouldUpdate, source.value, source.stamp, trackedSetValue, trackedStamp],
  );

  return tracked;
}

export function useSyncedValue<T, U>({
  source,
}: Pick<UseTrackedValueOptions<T, U>, "source">): UseValueResult<T, U> {
  const tracked = useTrackedValue({
    source,
    // Always update tracked source value
    shouldUpdate: () => true,
  });

  return useTrackedValue({
    source: { ...tracked, setValue: source.setValue && tracked.setValue },
    // Update target value when source has more recent change
    shouldUpdate: (s, t) => t === undefined || (s !== undefined && s > t),
  });
}
