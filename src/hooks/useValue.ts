import * as React from "react";
import * as moment from "moment";
import isEqual from "lodash.isequal";

/** Utility type for possible undefined return value */
type MaybeValue<T> = T | undefined;

/** Function that returns a value or undefined */
interface ValueGetter<T> {
  (): MaybeValue<T>;
}

/**
 * Alias for type which is either a getter or value.
 * See {@link React.useState}.
 */
type Valuer<T> = MaybeValue<T> | ValueGetter<T>;

/**
 * Return a plain value from either function or given value.
 */
function getValue<T>(valuer: Valuer<T>): MaybeValue<T>;
function getValue(valuer: unknown) {
  if (typeof valuer === "function") return valuer();
  return valuer;
}

/** Function to get timestamp for a variable */
type ValueStamper<R> = (...args: never[]) => R;
/** Utility type to extract the stamp type from a stamper function */
type Stamp<U> = (U extends ValueStamper<infer R> ? R : number) | number;
/**
 * Return the result of stamping using the stamper or falling back to
 * {@link moment.now} if no valid stamper is provided.
 */
function getStamp<T>(stamper: T): Stamp<T> {
  if (typeof stamper === "function") return stamper();
  return moment.now();
}

/** Utility type for running some code on a plain value */
export interface OnValue<T> {
  (newValue?: T): unknown;
}

/** Utility type for objects with value resolver setter */
interface UpdateableValue<T> {
  value: Valuer<T>;
  setValue: OnValue<T>;
}

/** Params for `useValue` which include the updateable initial value and time stamper */
interface UseValueOptions<T, U> {
  initial?: Partial<UpdateableValue<T>>;
  stamper?: U;
}

/** Results from `useValue` which includes the recent value, time stamp and updater */
interface UseValueResult<T, U> extends UpdateableValue<T> {
  value: MaybeValue<T>;
  stamp: Stamp<U>;
}

/**
 * Keep track of set value changes and triggers change handler on difference.
 * Uses {@link isEqual} to compare values when checking for a change.
 */
export function useValue<T, U>({
  initial,
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

/**
 * Params for `useTrackedValue` which include the source value, stamper and a predicate.
 */

type ShouldUpdateArg<T, U> = Pick<
  Partial<UseValueResult<T, U>>,
  "stamp" | "value"
>;
export type ShouldUpdateCallback<T, U> = (
  source?: ShouldUpdateArg<T, U>,
  target?: ShouldUpdateArg<T, U>,
) => boolean;
interface UseTrackedValueOptions<T, U> {
  source?: Partial<UseValueResult<T, U>>;
  stamper?: U;
  shouldUpdate: ShouldUpdateCallback<T, U>;
}

/**
 * This keeps track of the source value and updates the internal value using the
 * given update predicate method. This compares the stamp of the incoming source
 * and the internal value, updating the tracked internal value which is returned
 * if there is a change from the incoming source.
 */
export function useTrackedValue<T, U>({
  source,
  stamper,
  shouldUpdate,
}: UseTrackedValueOptions<T, U>): UseValueResult<T, U> {
  const tracked = useValue({
    initial: source,
    stamper,
  });

  // Conditionally update internal tracked value when given source value changes
  React.useEffect(
    function trackValue() {
      if (
        !shouldUpdate({ value: source?.value, stamp: source?.stamp }, tracked)
      )
        return;
      tracked.setValue(source?.value);
    },
    [shouldUpdate, source?.value, source?.stamp, tracked],
  );

  return tracked;
}

type Ignore<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type UseSycedValueOptions<T, U> = Ignore<
  UseTrackedValueOptions<T, U>,
  "shouldUpdate"
>;

/**
 * Sync a parent with a dependent child value. The incoming parent source updates are
 * always tracked, while the child value which is returned can be updated independently
 * only being overwritten by the parent source if there is a more recent stamped value.
 */
export function useSyncedValue<T, U>({
  shouldUpdate,
  source: { setValue: setSourceValue, ...source } = {},
  stamper,
}: UseSycedValueOptions<T, U>): UseValueResult<T, U> {
  const tracked = useTrackedValue({
    // Always update tracked value with latest source
    shouldUpdate: () => true,
    source,
    stamper,
  });

  const setTrackedValue = tracked.setValue;
  const setValue: OnValue<T> = React.useCallback(
    function setValue(newValue) {
      setTrackedValue(newValue);
      setSourceValue?.(newValue);
    },
    [setSourceValue, setTrackedValue],
  );

  return useTrackedValue({
    // Update target value when tracked source has more recent change
    shouldUpdate: shouldUpdate ?? defaultShouldUpdate,
    source: { ...tracked, setValue },
    stamper,
  });
}

/**
 *
 * @param s source stamp value
 * @param t target stamp value
 * @returns {boolean} true when target should be replaced with source
 */
function defaultShouldUpdate<T, U>(
  s?: ShouldUpdateArg<T, U>,
  t?: ShouldUpdateArg<T, U>,
) {
  return t?.stamp == undefined || (s?.stamp != undefined && s.stamp > t.stamp);
}
