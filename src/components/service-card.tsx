import Link from "next/link";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
}

export function ServiceCard({
  id,
  name,
  description,
  price,
  duration,
  category,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
        <span className="text-5xl">💅</span>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
            {category && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {category}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              ${price.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {duration} min
          </div>

          <Link
            href={`/services/${id}`}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View Details
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
