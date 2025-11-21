/**
 * Shop Page - Product Listing
 * Displays all products with category filtering
 */

import { getActiveProducts } from "@/lib/database/product-queries";
import { ProductCard } from "@/components/product-card";
import { Container } from "@/components/container";

// Get unique categories from products
function getUniqueCategories(products: any[]): string[] {
  const categories = products
    .map((p) => p.category)
    .filter((c): c is string => c !== null);
  return ["All Products", ...Array.from(new Set(categories))];
}

export default async function ShopPage() {
  // Fetch products server-side
  const products = await getActiveProducts();
  const categories = getUniqueCategories(products);

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16 border-b border-gray-200">
        <Container>
          <div className="text-center">
            <h1 className="font-serif text-5xl text-gray-900 mb-4">
              Shop Products
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our curated collection of premium beauty products
            </p>
          </div>
        </Container>
      </section>

      {/* Products Count */}
      <section className="py-6 bg-white border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {products.length} {products.length === 1 ? "product" : "products"}{" "}
              available
            </p>
            {/* Future: Add sort dropdown */}
          </div>
        </Container>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <Container>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products available
              </h3>
              <p className="text-gray-600">Check back soon for new products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
