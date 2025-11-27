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
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products/${id}`,
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
    <div className="pt-16 bg-gray-50 min-h-screen">
      <Container>
        <div className="py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-8">
            <Link href="/shop" className="hover:text-pink-600 transition-colors">
              Shop
            </Link>
            <span className="mx-2">/</span>
            {product.category && (
              <>
                <span>{product.category}</span>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg aspect-square relative">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-6xl">🛍️</span>
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  -{discountPercentage}%
                </div>
              )}

              {/* Out of Stock Overlay */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              {/* Category */}
              {product.category && (
                <div className="text-pink-600 font-medium text-sm mb-2">
                  {product.category}
                </div>
              )}

              {/* Product Name */}
              <h1 className="font-serif text-4xl text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({reviewCount}{' '}
                    {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₦{product.discount_price.toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div>
                    <span className="text-green-600 font-semibold">In Stock</span>
                    {product.stock <= 10 && (
                      <p className="text-orange-600 text-sm mt-1">
                        Only {product.stock} left in stock!
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-red-600 font-semibold">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* SKU */}
              {product.sku && (
                <div className="text-sm text-gray-500 mb-6">SKU: {product.sku}</div>
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
      </Container>
    </div>
  );
}
