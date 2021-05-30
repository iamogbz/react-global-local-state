import * as React from "react";
import * as moment from "moment";
import isEqual from "lodash.isequal";

type MaybeValue<T> = T | undefined;
export interface ValueGetter<T> {
  (): MaybeValue<T>;
}

export type Valuer<T> = MaybeValue<T> | ValueGetter<T>;
function getValue<T>(valuer: Valuer<T>): T
function getValue(valuer) {
  if (typeof valuer === 'function') return valuer();
  return valuer;
}

type ValueStamper<R> = (...args: never[]) => R;
type Stamp<U> = U extends ValueStamper<infer R> ? R : number;
function getStamp<T>(stamper: T): Stamp<T>;
function getStamp(stamper) {
  if (typeof stamper === 'function') return stamper();
  return moment.now();
}

export interface OnValue<T> {
  (newValue?: T): unknown;
}

interface UpdateableValue<T> {
  value: Valuer<T>,
  setValue: OnValue<T>;
}

interface UseValueOptions<T, U> extends Partial<UpdateableValue<T>> {
  getTimestamp?: U;
}

interface StampedValue<T, U> {
  value: T;
  timestamp: Stamp<U>;
}

type UseValueResult<T, U> =  UpdateableValue<T> & StampedValue<T, U>;

/**
 * Keep track of set value changes and triggers change handler on difference.
 * Uses {@link lodash.isequal} to compare values when checking for a change.
 */
export function useValue<T, U>({
  value: initialValue,
  setValue: onValueChange,
  getTimestamp: stamper,
}: UseValueOptions<T, U> = {}): UseValueResult<T, U> {

  const [state, setState] = React.useState(() => ({
    value: getValue(initialValue),
    timestamp: getStamp(stamper),
  }));

  const setValue: OnValue<T> = React.useCallback(
    function setValue(newValue) {
      const previousValue = state.value;
      if (isEqual(newValue ?? null, previousValue ?? null)) return;
      onValueChange(newValue);
      return setState({
        value: newValue,
        timestamp: getStamp(stamper),
      });
    },
    [onValueChange, setState, stamper, state.value],
  );

  return { ...state, setValue };
}

interface UseTrackedValueOptions<T, U> {
  source: UseValueResult<T, U>;
  getTimestamp?: U;
  shouldUpdate: (sourceTimestamp: Stamp<U>, targetTimestamp: Stamp<U>) => boolean;
}

export function useTrackedValue<T, U>({
  source,
  getTimestamp,
  shouldUpdate
}: UseTrackedValueOptions<T, U>): UseValueResult<T, U> {
  const tracked = useValue({
    ...source,
    getTimestamp,
  });

  // Conditionally update internal tracked value when given source value changes
  React.useEffect(function trackValue() {
    if (!shouldUpdate(source.timestamp, tracked.timestamp)) return;
    tracked.setValue(source.value);
  }, [shouldUpdate, source.value, source.timestamp, tracked.setValue, tracked.timestamp]);

  return tracked;
}

export function useSyncedValue<T, U>(params: UseTrackedValueOptions<T, U>): UseValueResult<T, U> {
  const source = useTrackedValue({
    ...params,
    // Always update tracked source value
    shouldUpdate: () => true,
  });

  return useTrackedValue({
    source,
    // Update target value with source when source has more recent change
    shouldUpdate: (s, t) => s > t,
  });
}
