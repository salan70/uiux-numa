import { type CSSProperties } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  name: string;
  legend: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
}: Props<T>) {
  const index = Math.max(
    options.findIndex((item) => item.value === value),
    0,
  );

  return (
    <fieldset className="segmented-control">
      <legend>{legend}</legend>
      <RadioGroup
        name={name}
        value={value}
        onValueChange={(next) => {
          if (typeof next === "string") onChange(next as T);
        }}
        className="segmented-control-group"
        style={
          {
            "--sk-index": String(index),
            "--sk-count": String(options.length),
          } as CSSProperties
        }
      >
        <span className="segmented-control-thumb" aria-hidden="true" />
        {options.map((option) => (
          <Radio.Root key={option.value} value={option.value} className="segmented-control-option">
            {option.label}
          </Radio.Root>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
