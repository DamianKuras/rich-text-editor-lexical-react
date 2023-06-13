type FloatingLabelInputProps = {
  value: string | number;
  id: string;
  label: string;
  type: "text" | "number";
  maxValue?: number;
  minValue?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function FloatingLabelInput({
  value,
  id,
  label,
  type,
  maxValue,
  minValue,
  onChange,
  onKeyDown,
}: FloatingLabelInputProps): JSX.Element {
  return (
    <div className="relative z-0">
      <input
        type={type}
        id={id}
        className="peer block w-full appearance-none rounded-lg border-2 border-floating-input-border 
                   bg-transparent px-2.5 pb-2.5 pt-4 text-sm text-toolbar-text
                   focus:border-floating-input-border-focused focus:outline-none focus:ring-0"
        placeholder=" "
        value={value}
        onChange={onChange}
        {...(onKeyDown && { onKeyDown })}
        {...(type === "number" && maxValue && { max: maxValue })}
        {...(type === "number" && minValue && { min: minValue })}
      />
      <label
        htmlFor={id}
        className="absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                   bg-floating-input-label-background px-2 text-sm text-floating-intput-label-text duration-300 
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 
                   peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-sm 
                   peer-focus:text-floating-input-label-focused"
      >
        {label}
      </label>
    </div>
  );
}
