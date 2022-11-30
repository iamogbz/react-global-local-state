/* eslint-disable jest/max-expects */
/* eslint-disable jest/require-hook */
import { act, renderHook } from "@testing-library/react";
import {
  ShouldUpdateCallback,
  useSyncedValue,
  useTrackedValue,
  useValue,
} from "./useValue";

function mockStamper() {
  let lastStamp = 0;
  return () => ((lastStamp += 1), lastStamp);
}

describe("useValue", () => {
  [
    [undefined],
    [null],
    ["plain value"],
    [() => "function value", "function value"],
  ].forEach(([value, expectedValue]) => {
    it(`creates result successfully when initial value is ${value}`, () => {
      expect.assertions(4);
      const { result } = renderHook(() => useValue({ initial: { value } }));

      const stampA = result.current.stamp;
      expect(result.current.stamp).toBeGreaterThan(0);
      expect([expectedValue, value]).toContain(result.current.value);

      const newValue = "new value";
      act(() => result.current.setValue(newValue));

      expect(result.current.value).toBe(newValue);
      expect(result.current.stamp).toBeGreaterThanOrEqual(stampA);
    });
  });

  it("uses new stamps value successfully", () => {
    expect.assertions(8);
    const stamper = mockStamper();
    const setValue = jest.fn();
    const initialValue = "initial value";
    const { result } = renderHook(() =>
      useValue({ initial: { value: initialValue, setValue }, stamper }),
    );

    expect(result.current.stamp).toBe(1);
    expect(setValue).not.toHaveBeenCalled();

    // does not updates value or stamp when equal
    act(() => result.current.setValue(initialValue));

    expect(result.current.stamp).toBe(1);
    expect(result.current.value).toBe(initialValue);
    expect(setValue).not.toHaveBeenCalled();

    // updates with new stamped value when different
    const newValue = "new value";
    act(() => result.current.setValue("new value"));

    expect(result.current.stamp).toBe(2);
    expect(result.current.value).toBe(newValue);
    expect(setValue).toHaveBeenLastCalledWith(newValue);
  });
});

describe("useTrackedValue", () => {
  it("updates tracked value using should update predicate", () => {
    expect.assertions(12);
    const setValue = jest.fn();
    const shouldUpdate = jest.fn();
    const stamper = mockStamper();
    const { result, rerender } = renderHook((props: Record<string, unknown>) =>
      useTrackedValue({
        source: { setValue, ...props },
        shouldUpdate: shouldUpdate,
        stamper,
      }),
    );
    expect(result.current.value).toBeUndefined();
    expect(setValue).not.toHaveBeenCalled();
    expect(shouldUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ stamp: undefined }),
      expect.objectContaining({ stamp: 1 }),
    );

    shouldUpdate.mockReturnValue(false);
    rerender({ value: "Initial value", stamp: 0 });
    expect(result.current.value).toBeUndefined();
    expect(setValue).not.toHaveBeenCalled();
    expect(shouldUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ stamp: 0 }),
      expect.objectContaining({ stamp: 1 }),
    );

    const valueA = "Value A";
    shouldUpdate.mockReturnValue(true);
    rerender({ value: valueA, stamp: 1 });
    expect(result.current.value).toBe(valueA);
    expect(setValue).toHaveBeenLastCalledWith(valueA);
    expect(shouldUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ stamp: 1 }),
      expect.objectContaining({ stamp: 2 }),
    );

    const valueB = "Value B";
    rerender({ value: valueB, stamp: 2 });
    expect(result.current.value).toBe(valueB);
    expect(setValue).toHaveBeenLastCalledWith(valueB);
    expect(shouldUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ stamp: 2 }),
      expect.objectContaining({ stamp: 3 }),
    );
  });
});

describe("useSyncedValue", () => {
  it("updates only target when set value is not given", () => {
    expect.assertions(2);
    const { result } = renderHook(
      (props: { source: Record<string, unknown> }) =>
        useSyncedValue({ ...props }),
    );
    expect(result.current.value).toBeUndefined();

    const newValue = "new value";
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(newValue);
  });

  it("updates source successfully when set value is given", () => {
    expect.assertions(4);
    const setValue = jest.fn();
    const shouldUpdate: ShouldUpdateCallback<string, number> = (s) =>
      !!s?.value;
    const { result } = renderHook(
      (props: { source: Record<string, unknown> }) =>
        useSyncedValue({
          shouldUpdate,
          source: { setValue, ...props?.source },
        }),
    );
    expect(result.current.value).toBeUndefined();
    expect(setValue).not.toHaveBeenCalled();

    const newValue = "New value";
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(newValue);
    expect(setValue).toHaveBeenLastCalledWith(newValue);
  });

  it("updates only when new value has more recent stamp", () => {
    expect.assertions(2);
    const stamper = mockStamper();
    const { result, rerender } = renderHook(
      (props: { source: Record<string, unknown> }) =>
        useSyncedValue({ stamper, ...props }),
    );
    expect(result.current.value).toBeUndefined();

    const newValue = "New value";
    rerender({ source: { value: newValue, stamp: 0 } });
    expect(result.current.value).toBe(newValue);
  });

  it("does not update when new value has older stamp", () => {
    expect.assertions(2);
    const stamper = () => 0;
    const { result, rerender } = renderHook(
      (props: { source: Record<string, unknown> }) =>
        useSyncedValue({ stamper, ...props }),
    );
    expect(result.current.value).toBeUndefined();

    const newValue = "New value";
    rerender({ source: { value: newValue, stamp: 0 } });
    expect(result.current.value).toBeUndefined();
  });
});
