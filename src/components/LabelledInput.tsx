import * as React from "react";
import { Input, InputProps } from "./Input";

export type LabelledInputProps = InputProps & {
  label: { text: string; style?: React.CSSProperties };
};

export function LabelledInput({
  label: { text: labelText, style: labelStyle },
  ...inputProps
}: LabelledInputProps): JSX.Element {
  return (
    <>
      <label htmlFor={inputProps.name ?? inputProps.id} style={labelStyle}>
        {labelText}
      </label>
      <Input {...inputProps} />
    </>
  );
}
