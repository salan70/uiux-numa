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
  return (
    <fieldset className="segmented-control">
      <legend>{legend}</legend>
      <div className="segmented-control-group" role="radiogroup" aria-label={legend}>
        {options.map((option) => (
          <label key={option.value} className="segmented-control-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
