/**
 * Shopping Cart Page
 * Displays cart items with quantity management and checkout
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/container';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discount_price: number | null;
    image_url: string | null;
    stock: number;
    sku: string | null;
  };
}

interface CartData {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?redirect=/cart');
          return;
        }
        throw new Error('Failed to load cart');
      }

      const data = await res.json();
      setCartData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update quantity');
      }

      await fetchCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm('Remove this item from cart?')) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!cartData || cartData.cart.length === 0) {
    return (
      <div className="pt-16 bg-gray-50 min-h-screen">
        <Container>
          <div className="py-16 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const subtotal = cartData.subtotal;
  const discount = cartData.discount;
  const total = cartData.total;

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.cart.map((item) => {
                const product = item.product;
                const displayPrice = product.discount_price || product.price;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-6 p-6 bg-white border border-gray-200 rounded-xl"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🛍️</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-primary font-bold">
                        ₦{displayPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </p>
                      {product.discount_price && product.discount_price < product.price && (
                        <p className="text-xs text-gray-500 line-through">
                          ₦{product.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                      <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                        disabled={updatingItems.has(item.id)}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Discount</span>
                      <span className="font-medium">-₦{discount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-4 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary">₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/checkout');
                  }}
                  type="button"
                  className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-lg mb-4"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/shop');
                  }}
                  type="button"
                  className="w-full text-center text-primary hover:text-primary/80 transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
