import * as React from 'react';
import { OnValue, useSyncedValue } from './hooks/useValue';
import { Input, InputProps } from './Input';

type LabelledInputProps = InputProps & {
  label: { text: string; style?: React.CSSProperties };
};
function LabelledInput({
  label: { text: labelText, style: labelStyle },
  ...inputProps
}: LabelledInputProps) {
  return (
    <>
      <label htmlFor={inputProps.name ?? inputProps.id} style={labelStyle}>
        {labelText}
      </label>
      <Input {...inputProps} />
    </>
  );
}

type SourceTargetInputProps = Pick<LabelledInputProps, 'id' | 'label'> & {
  source: {
    value?: string;
    setValue?: OnValue<string>;
  };
};
function SourceTargetInput({ id, label, source }: SourceTargetInputProps) {
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

export default function App(): JSX.Element {
  const labelStyle: React.CSSProperties = {
    width: '180px',
    display: 'inline-block',
    textAlign: 'right',
    marginRight: '20px',
  };
  const [value, setValue] = React.useState<string | undefined>(
    'initial parent value'
  );

  return (
    <div className="App">
      <LabelledInput
        id="parentValue"
        label={{ text: ' parent: ', style: labelStyle }}
        onValueChange={setValue}
        value={value}
      />
      <hr />
      <SourceTargetInput
        id="childValue"
        label={{ text: ' child that updates parent: ', style: labelStyle }}
        source={{ value, setValue }}
      />
      <hr />
      <SourceTargetInput
        id="childValue"
        label={{ text: ' child that only receives: ', style: labelStyle }}
        source={{ value }}
      />
    </div>
  );
}
