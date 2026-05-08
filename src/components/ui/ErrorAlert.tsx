interface Props {
  error?: Error | string | null;
  onRetry?: () => void;
}

export function ErrorAlert({ error, onRetry }: Props) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message;
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-xs text-red-600 underline hover:no-underline">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
