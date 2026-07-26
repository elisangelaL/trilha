export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="seg" style={{ width: "100%", display: "flex" }}>
      {options.map((opt) => (
        <label key={opt.value} className="seg-opt" style={{ flex: 1, justifyContent: "center" }}>
          <input type="radio" name={name} checked={value === opt.value} onChange={() => onChange(opt.value)} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
