import { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: 'text-white disabled:opacity-60',
  danger: 'bg-red-400 text-white hover:bg-red-500 disabled:bg-red-200',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
};

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, className = '', style, ...rest }: Props) {
  const primaryStyle = variant === 'primary' ? { backgroundColor: '#4A8394', ...style } : style;
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={primaryStyle}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-opacity ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-90'} ${className}`}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
