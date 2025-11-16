import Link from "next/link";
import { Container } from "@/components/container";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

// Placeholder product data
const PRODUCT_DATA: Record<string, any> = {
  "1": {
    id: "1",
    name: "Luxury Face Serum",
    description: "Anti-aging serum with vitamin C and hyaluronic acid",
    longDescription:
      "Our Luxury Face Serum is a premium anti-aging formula that combines powerful ingredients like vitamin C, hyaluronic acid, and peptides to reduce fine lines, improve skin texture, and restore radiance. Suitable for all skin types, this lightweight serum absorbs quickly and works throughout the day to protect and nourish your skin.",
    price: 89.99,
    inStock: true,
    ingredients: [
      "Vitamin C",
      "Hyaluronic Acid",
      "Peptides",
      "Aloe Vera",
      "Green Tea Extract",
    ],
    benefits: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture and tone",
      "Boosts collagen production",
      "Provides deep hydration",
      "Protects against environmental damage",
    ],
  },
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = PRODUCT_DATA[params.id] || PRODUCT_DATA["1"];

  return (
    <div className="pt-16">
      {/* Breadcrumb & Back */}
      <section className="bg-gray-50 py-6 border-b border-gray-200">
        <Container>
          <Link
            href="/shop"
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Shop
          </Link>
        </Container>
      </section>

      {/* Product Details */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-purple-200 flex items-center justify-center">
              <span className="text-8xl">🌸</span>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {product.description}
                </p>
                <div className="flex items-baseline gap-4">
                  <p className="text-4xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                  {product.inStock ? (
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="quantity"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
                <button
                  disabled={!product.inStock}
                  className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>

              {/* Key Benefits */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Key Benefits:
                </h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-primary mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Product Description & Ingredients */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {product.longDescription}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Key Ingredients
              </h2>
              <ul className="space-y-2">
                {product.ingredients.map(
                  (ingredient: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                      {ingredient}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
