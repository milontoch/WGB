import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  inStock = true,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform relative">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">🌸</span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">${price.toFixed(2)}</p>

          <Link
            href={`/shop/${id}`}
            className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
