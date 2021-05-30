import * as React from 'react';
import { OnValue, useSyncedValue } from './hooks/useValue';

function LabelInput({
  labelText,
  onValueChange,
  ...inputProps
}: Omit<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
  'onChange'
> & { labelText: string; onValueChange: OnValue<string> }) {
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
  ...useSyncedValueParams
}: {
  id: string;
  labelText: string;
  source: {
    value?: string;
    setValue?:  OnValue<string>;
  }
}) {
  const synced = useSyncedValue(useSyncedValueParams);

  return (
    <LabelInput
      id={id}
      labelText={labelText}
      value={synced.value}
      onValueChange={synced.setValue}
    />
  );
}

export default function App() {
  const [value, setValue] = React.useState('initial parent value');

  return (
    <div className='App'>
      <LabelInput
        id='parentValue'
        labelText=' parent: '
        onValueChange={setValue}
        value={value}
      />
      <hr />
      <SourceTargetInput
        id='childValue'
        labelText=' child: '
        source={{ value, setValue }}
      />
    </div>
  );
}
