import Link from "next/link";
import { Container } from "@/components/container";

// Placeholder cart data
const CART_ITEMS = [
  {
    id: "1",
    name: "Luxury Face Serum",
    price: 89.99,
    quantity: 1,
    image: "🌸",
  },
  {
    id: "2",
    name: "Silk Hair Mask",
    price: 45.0,
    quantity: 2,
    image: "🌸",
  },
];

export default function CartPage() {
  const subtotal = CART_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 10.0;
  const total = subtotal + shipping;

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Shopping Cart
            </h1>
            <p className="text-xl text-gray-600">
              Review your items before checkout
            </p>
          </div>
        </Container>
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-white">
        <Container>
          {CART_ITEMS.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Add some products to get started
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {CART_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-6 p-6 bg-white border border-gray-200 rounded-xl"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{item.image}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-primary font-bold">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-4">
                      <select
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        defaultValue={item.quantity}
                      >
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                      </select>
                    </div>

                    {/* Remove */}
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
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
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-medium">
                        ${shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-lg mb-4">
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/shop"
                    className="block text-center text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
