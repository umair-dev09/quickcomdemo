// Loading Spinner Component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`
          ${sizeClasses[size]}
          border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin
        `}
      />
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
    </div>
  );
}
