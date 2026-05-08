import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function DateInput({ label, error, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        {...rest}
        className={`border px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        } bg-white text-gray-800 ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
