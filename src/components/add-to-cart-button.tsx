/**
 * Add to Cart Button Component
 * Client component for adding products to cart with quantity selection
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stock: number;
  isActive: boolean;
}

export function AddToCartButton({
  productId,
  productName,
  stock,
  isActive,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAvailable = isActive && stock > 0;

  const handleAddToCart = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      setSuccess(
        `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart!`
      );

      // Notify the app that the cart has been updated
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:updated"));
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to cart");
      }

      // Notify the app that the cart has been updated
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:updated"));
      }

      // Redirect to cart
      router.push("/cart");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <div className="space-y-4">
        <button
          disabled
          className="w-full py-4 bg-gray-300 text-gray-600 rounded-xl font-semibold cursor-not-allowed"
        >
          {!isActive ? "Product Unavailable" : "Out of Stock"}
        </button>
        <button
          onClick={() => router.push("/shop")}
          className="w-full py-4 border-2 border-pink-600 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center font-semibold hover:border-pink-600 hover:text-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="text-xl font-semibold text-gray-900 w-12 text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center font-semibold hover:border-pink-600 hover:text-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
          <span className="text-sm text-gray-600 ml-2">(Max: {stock})</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="py-4 border-2 border-pink-600 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className="py-4 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Buy Now"}
        </button>
      </div>

      {/* View Cart Link */}
      <button
        onClick={() => router.push("/cart")}
        className="w-full text-center text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
      >
        View Cart
      </button>
    </div>
  );
}
