import { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  disabledLabel?: string;
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export function Select({ label, options, placeholder, error, onChange, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <select
          {...rest}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full appearance-none border rounded-lg px-3 py-2.5 text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            error ? 'border-red-400' : 'border-gray-300'
          } ${rest.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'text-gray-800 cursor-pointer'} ${className}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.disabled && opt.disabledLabel ? `${opt.label} (${opt.disabledLabel})` : opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
