import { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
}

export function TextInput({ label, error, prefix, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center justify-center px-3 bg-teal-700 text-white text-sm rounded-l-lg border border-teal-700">
            {prefix}
          </span>
        )}
        <input
          {...rest}
          className={`flex-1 border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            prefix ? 'rounded-r-lg' : 'rounded-lg'
          } ${error ? 'border-red-400' : 'border-gray-300'} ${
            rest.disabled ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-800'
          } ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
