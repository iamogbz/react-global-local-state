import * as React from "react";
import { OnValue, useSyncedValue } from "../hooks/useValue";
import { LabelledInput, LabelledInputProps } from "./LabelledInput";

export type SourceTargetInputProps = Pick<
  LabelledInputProps,
  "id" | "label"
> & {
  source: {
    value?: string;
    setValue?: OnValue<string>;
  };
};

export function SourceTargetInput({
  id,
  label,
  source,
}: SourceTargetInputProps): JSX.Element {
  const synced = useSyncedValue({ source });

  return (
    <LabelledInput
      id={id}
      label={label}
      value={synced.value}
      onValueChange={synced.setValue}
    />
  );
}
