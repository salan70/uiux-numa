import { Select } from "@base-ui/react/select";
import { usePortalContainer } from "./PortalContainer";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

export function SelectField<T extends string>({ label, value, options, onChange }: Props<T>) {
  const container = usePortalContainer();
  const items = options.map((item) => ({ value: item.value, label: item.label }));

  return (
    <Select.Root
      items={items}
      value={value}
      modal={false}
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
    >
      <div className="select-field">
        <Select.Label className="select-label">{label}</Select.Label>
        <Select.Trigger className="select-trigger">
          <Select.Value />
          <Select.Icon className="select-icon">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.2 5.7 8 10.5l4.8-4.8-1.1-1.1L8 8.3 4.3 4.6z" fill="currentColor" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal container={container}>
          <Select.Positioner className="select-positioner" sideOffset={6}>
            <Select.Popup className="select-popup">
              <Select.List className="select-list">
                {options.map((item) => (
                  <Select.Item key={item.value} value={item.value} className="select-item">
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </div>
    </Select.Root>
  );
}
