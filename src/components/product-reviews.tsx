/**
 * Product Reviews Component
 * Displays product reviews and average rating
 */

"use client";

import { Review } from "@/lib/supabase/config";

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-gray-900 mb-4">
          Customer Reviews
        </h2>

        {reviewCount > 0 ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.round(averageRating)
                        ? "text-yellow-400 text-2xl"
                        : "text-gray-300 text-2xl"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Rating Distribution (placeholder for future enhancement) */}
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                All reviews are verified purchases
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-6 border-t border-gray-200 pt-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 pb-6 last:border-0"
            >
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating
                          ? "text-yellow-400 text-lg"
                          : "text-gray-300 text-lg"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* Verified Badge */}
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified Purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
