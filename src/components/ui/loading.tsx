/**
 * Loading Spinner Component
 * Reusable loading state with Minimal Luxury styling
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-12 w-12 border-2",
    lg: "h-16 w-16 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-[#D4B58E] border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Full Page Loading Component
 */
export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}
