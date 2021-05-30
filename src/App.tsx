import * as React from "react";
import { OnValue, useSyncedValue } from "./hooks/useValue";

function LabelInput({
  labelText,
  onValueChange,
  ...inputProps
}: Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  "onChange"
> & { labelText: string; onValueChange?: OnValue<string> }) {
  const onChange = React.useCallback(
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
      return onValueChange?.(e.currentTarget.value);
    },
    [onValueChange],
  );

  return (
    <>
      <label htmlFor={inputProps.name ?? inputProps.id}>{labelText}</label>
      <input {...inputProps} onChange={onChange} />
    </>
  );
}

function SourceTargetInput({
  id,
  labelText,
  source,
}: {
  id: string;
  labelText: string;
  source: {
    value?: string;
    setValue?: OnValue<string>;
  };
}) {
  const synced = useSyncedValue({ source });

  return (
    <LabelInput
      id={id}
      labelText={labelText}
      value={synced.value}
      onValueChange={synced.setValue}
    />
  );
}

export default function App(): JSX.Element {
  const [value, setValue] = React.useState<string | undefined>(
    "initial parent value",
  );

  return (
    <div className="App">
      <LabelInput
        id="parentValue"
        labelText=" parent: "
        onValueChange={setValue}
        value={value}
      />
      <hr />
      <SourceTargetInput
        id="childValue"
        labelText=" child that updates parent: "
        source={{ value, setValue }}
      />
      <hr />
      <SourceTargetInput
        id="childValue"
        labelText=" child that only receives: "
        source={{ value }}
      />
    </div>
  );
}
