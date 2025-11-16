import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";

// Placeholder product data
const PRODUCTS = [
  {
    id: "1",
    name: "Luxury Face Serum",
    description: "Anti-aging serum with vitamin C and hyaluronic acid",
    price: 89.99,
    inStock: true,
  },
  {
    id: "2",
    name: "Silk Hair Mask",
    description: "Deep conditioning treatment for smooth, shiny hair",
    price: 45.0,
    inStock: true,
  },
  {
    id: "3",
    name: "Rose Water Toner",
    description: "Natural toner to refresh and balance your skin",
    price: 29.99,
    inStock: true,
  },
  {
    id: "4",
    name: "Hydrating Moisturizer",
    description: "24-hour hydration with SPF 30 protection",
    price: 65.0,
    inStock: true,
  },
  {
    id: "5",
    name: "Volumizing Shampoo",
    description: "Professional grade shampoo for fuller, thicker hair",
    price: 38.0,
    inStock: false,
  },
  {
    id: "6",
    name: "Nail Care Kit",
    description: "Complete manicure set with premium tools",
    price: 55.0,
    inStock: true,
  },
];

const CATEGORIES = ["All Products", "Skincare", "Haircare", "Makeup", "Tools"];

export default function ShopPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Shop Products
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our curated collection of premium beauty products
            </p>
          </div>
        </Container>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-gray-200 bg-white sticky top-16 z-40">
        <Container>
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full border border-gray-300 hover:border-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
