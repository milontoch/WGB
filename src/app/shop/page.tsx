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
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-white via-[#FAF7F2] to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="font-['Poppins'] text-5xl md:text-6xl font-semibold text-[#111111] mb-4">
              Shop Our Collection
            </h1>
            <p className="text-xl text-[#111111]/60 font-light max-w-2xl mx-auto">
              Discover curated beauty products for your luxury routine
            </p>
          </div>
        </div>
      </section>

      {/* Products Count */}
      <section className="py-6 bg-white border-y border-[#111111]/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#111111]/60 font-light">
              {products.length} {products.length === 1 ? "product" : "products"} available
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[18px] shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="font-['Poppins'] text-2xl font-semibold text-[#111111] mb-2">
                No products available
              </h3>
              <p className="text-[#111111]/60 font-light">Check back soon for new products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
