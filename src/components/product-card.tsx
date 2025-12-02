/**
 * Product Card Component
 * Displays product with image, name, price, discount badge
 */

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/supabase/config';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  if (!product) {
    return null;
  }
  
  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group block bg-white rounded-[18px] overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_5px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-[#FAF7F2] overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4B58E]/10 to-[#D4B58E]/5">
            <span className="text-6xl opacity-20">🛍️</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-[#D4B58E] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{discountPercent}%
          </div>
        )}
        
        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-white text-[#111111] text-sm font-semibold px-5 py-2 rounded-full shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 text-center">
        {/* Category */}
        {product.category && (
          <span className="text-xs text-[#D4B58E] font-medium uppercase tracking-wide">
            {product.category}
          </span>
        )}

        {/* Product Name */}
        <h3 className="font-['Poppins'] text-base font-semibold text-[#111111] mt-2 mb-3 line-clamp-2 group-hover:text-[#D4B58E] transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 justify-center mb-4">
          <span className="text-2xl font-bold text-[#D4B58E]">
            ₦{displayPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </span>
          {hasDiscount && (
            <span className="text-sm text-[#111111]/40 line-through font-light">
              ₦{product.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-orange-600 font-medium">
            Only {product.stock} left!
          </p>
        )}
        
        {/* View Button */}
        <div className="mt-4">
          <span className="inline-block text-sm text-[#D4B58E] font-medium group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
