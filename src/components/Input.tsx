import * as React from "react";
import { OnValue } from "../hooks/useValue";

export type InputProps = Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "onChange"
> & { onValueChange?: OnValue<string> };

export function Input({
  onValueChange,
  ...inputProps
}: InputProps): JSX.Element {
  const onChange = React.useCallback(
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
      return onValueChange?.(e.currentTarget.value);
    },
    [onValueChange],
  );

  return <input {...inputProps} onChange={onChange} />;
}
