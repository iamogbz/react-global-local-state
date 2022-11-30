import * as React from "react";
import { LabelledInput } from "./components/LabelledInput";
import { SourceTargetInput } from "./components/SourceTargetInput";

export default function App(): JSX.Element {
  const labelStyle: React.CSSProperties = {
    width: "180px",
    display: "inline-block",
    textAlign: "right",
    marginRight: "20px",
  };
  const [value, setValue] = React.useState<string | undefined>(
    "initial parent value",
  );

  return (
    <div className="App">
      <LabelledInput
        id="parentValue"
        label={{ text: " parent: ", style: labelStyle }}
        onValueChange={setValue}
        value={value}
      />
      <hr />
      <SourceTargetInput
        id="childValue"
        label={{ text: " child that updates parent: ", style: labelStyle }}
        source={{ value, setValue }}
      />
      <hr />
      <SourceTargetInput
        id="childValue"
        label={{ text: " child that only receives: ", style: labelStyle }}
        source={{ value }}
      />
    </div>
  );
}
