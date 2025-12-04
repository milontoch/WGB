/**
 * Product Detail Page
 * Displays full product information with reviews and add to cart
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/container';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { ProductReviews } from '@/components/product-reviews';

async function getProductDetails(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/api/products/${id}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductDetails(id);

  if (!data || !data.product) {
    notFound();
  }

  const { product, reviews, averageRating, reviewCount } = data;

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="py-32">
          {/* Breadcrumb */}
          <nav className="text-sm text-[#111111]/60 mb-12 font-light">
            <Link href="/shop" className="hover:text-[#D4B58E] transition-colors">
              Shop
            </Link>
            <span className="mx-2">/</span>
            {product.category && (
              <>
                <span>{product.category}</span>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-[#111111]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Product Image */}
            <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_10px_40px_rgba(212,181,142,0.15)] aspect-square relative">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4B58E]/10 to-[#FAF7F2]">
                  <span className="text-8xl">🛍️</span>
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-6 right-6 bg-[#D4B58E] text-white px-5 py-2 rounded-full font-semibold shadow-lg text-sm">
                  -{discountPercentage}%
                </div>
              )}

              {/* Out of Stock Overlay */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-white text-[#111111] px-8 py-4 rounded-full font-semibold text-lg shadow-xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-[24px] p-10 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
              {/* Category */}
              {product.category && (
                <div className="text-[#D4B58E] font-medium text-sm mb-4 uppercase tracking-wide">
                  {product.category}
                </div>
              )}

              {/* Product Name */}
              <h1 className="font-['Poppins'] text-4xl font-bold text-[#111111] mb-6">
                {product.name}
              </h1>

              {/* Rating */}
              {reviewCount > 0 && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(averageRating)
                            ? 'text-[#D4B58E]'
                            : 'text-[#111111]/20'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-[#111111]/60 font-light">
                    {averageRating.toFixed(1)} ({reviewCount}{' '}
                    {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-8">
                {hasDiscount ? (
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-[#D4B58E]">
                      ₦{product.discount_price.toLocaleString()}
                    </span>
                    <span className="text-xl text-[#111111]/40 line-through font-light">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-[#D4B58E]">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-8 pb-8 border-b border-[#111111]/10">
                {product.stock > 0 ? (
                  <div>
                    <span className="text-green-600 font-semibold text-sm">✓ In Stock</span>
                    {product.stock <= 10 && (
                      <p className="text-orange-600 text-sm mt-2 font-light">
                        Only {product.stock} left in stock!
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="font-['Poppins'] font-semibold text-[#111111] mb-3">Description</h3>
                  <p className="text-[#111111]/70 font-light leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* SKU */}
              {product.sku && (
                <div className="text-sm text-[#111111]/40 mb-8 font-light">SKU: {product.sku}</div>
              )}

              {/* Add to Cart */}
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                stock={product.stock}
                isActive={product.is_active}
              />
            </div>
          </div>

          {/* Reviews Section */}
          <ProductReviews
            productId={product.id}
            reviews={reviews}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
        </div>
      </div>
    </div>
  );
}
