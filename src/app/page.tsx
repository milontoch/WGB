import Link from "next/link";
import { Container } from "@/components/container";
import { ServiceCard } from "@/components/service-card";
import { ProductCard } from "@/components/product-card";

// Placeholder data
const FEATURED_SERVICES = [
  {
    id: "1",
    name: "Signature Haircut & Style",
    description: "Professional haircut with styling by our expert stylists",
    price: 85.0,
    duration: 60,
    category: "Hair",
  },
  {
    id: "2",
    name: "Deluxe Facial Treatment",
    description: "Deep cleansing facial with hydration and massage",
    price: 120.0,
    duration: 75,
    category: "Skincare",
  },
  {
    id: "3",
    name: "Bridal Makeup Package",
    description: "Complete bridal makeup with trial session included",
    price: 250.0,
    duration: 120,
    category: "Makeup",
  },
];

const FEATURED_PRODUCTS = [
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
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Elevate Your
                <span className="text-primary block">Beauty Experience</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover premium beauty services and curated products designed
                to bring out your natural radiance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-medium rounded-md border-2 border-gray-200 hover:border-primary hover:text-primary transition-colors"
                >
                  Explore Services
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-gray-600 mt-1">Happy Clients</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-gray-600 mt-1">Services</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10+</p>
                  <p className="text-sm text-gray-600 mt-1">Years Experience</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-purple-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-gray-600">Hero Image Placeholder</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add your beauty imagery here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-gray-600">
              Our most booked beauty treatments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {FEATURED_SERVICES.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              View All Services
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop Our Products
            </h2>
            <p className="text-xl text-gray-600">
              Premium beauty products for your daily routine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Shop All Products
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-pink-600">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Book your appointment today and experience the difference
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center px-10 py-4 bg-white text-primary font-semibold rounded-md hover:bg-gray-50 transition-colors shadow-xl"
            >
              Schedule Your Visit
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
