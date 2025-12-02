import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { ProductCard } from "@/components/product-card";

// Placeholder data
const FEATURED_SERVICES = [
  {
    id: "1",
    name: "Permanent Tattoo",
    description: "Professional permanent tattoo artistry with custom designs tailored to your vision",
    price: 250,
    duration: 180,
    category: "Body Art",
  },
  {
    id: "2",
    name: "Lash Extension",
    description: "Luxurious lash extensions for dramatic volume and length that enhance your natural beauty",
    price: 120,
    duration: 90,
    category: "Lashes",
  },
  {
    id: "3",
    name: "Teeth Whitening",
    description: "Professional teeth whitening treatment for a brighter, confident smile in one session",
    price: 200,
    duration: 75,
    category: "Dental",
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
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-[#D4B58E]/10 border border-[#D4B58E]/20 rounded-full mb-4">
                <span className="text-[#D4B58E] text-sm font-medium tracking-wide">PREMIUM BEAUTY SERVICES</span>
              </div>
              
              <h1 className="font-['Poppins'] text-5xl md:text-6xl lg:text-7xl font-bold text-[#111111] leading-tight">
                Elevate Your
                <span className="block text-[#D4B58E]">Beauty Journey</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-[#111111]/60 font-light leading-relaxed max-w-xl">
                Experience luxury beauty treatments and wellness services crafted to enhance your natural radiance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center px-10 py-5 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-lg hover:shadow-xl"
                >
                  BOOK APPOINTMENT
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-10 py-5 bg-white text-[#111111] text-sm font-semibold tracking-wide rounded-full border-2 border-[#111111]/10 hover:border-[#D4B58E] hover:text-[#D4B58E] transition-all"
                >
                  EXPLORE SERVICES
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-12">
                <div>
                  <p className="text-4xl font-bold text-[#D4B58E] mb-2">500+</p>
                  <p className="text-sm text-[#111111]/50 font-light tracking-wide">Happy Clients</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#D4B58E] mb-2">9</p>
                  <p className="text-sm text-[#111111]/50 font-light tracking-wide">Services</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#D4B58E] mb-2">10+</p>
                  <p className="text-sm text-[#111111]/50 font-light tracking-wide">Years Experience</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[24px] bg-gradient-to-br from-[#D4B58E]/20 via-[#FAF7F2] to-[#D4B58E]/10 flex items-center justify-center shadow-[0_10px_40px_rgba(212,181,142,0.15)]">
                <div className="text-center p-12">
                  <div className="text-8xl mb-6">✨</div>
                  <p className="text-[#111111]/60 font-light text-lg">Hero Image</p>
                  <p className="text-sm text-[#111111]/40 mt-2 font-light">
                    Replace with beauty imagery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-['Poppins'] text-4xl md:text-5xl font-semibold text-[#111111] mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-[#111111]/60 font-light max-w-2xl mx-auto">
              Discover our most loved beauty treatments designed for excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
            {FEATURED_SERVICES.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center px-10 py-4 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-lg hover:shadow-xl"
            >
              VIEW ALL SERVICES
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
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-[#FAF7F2]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-['Poppins'] text-4xl md:text-5xl font-semibold text-[#111111] mb-4">
              Shop Our Products
            </h2>
            <p className="text-xl text-[#111111]/60 font-light max-w-2xl mx-auto">
              Curated beauty essentials for your daily luxury routine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/shop"
              className="inline-flex items-center px-10 py-4 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-lg hover:shadow-xl"
            >
              SHOP ALL PRODUCTS
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
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="font-['Poppins'] text-4xl md:text-5xl font-semibold text-[#111111] mb-4">
              Client Testimonials
            </h2>
            <p className="text-xl text-[#111111]/60 font-light">
              What our valued clients say about us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#FAF7F2] rounded-[18px] p-8 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <svg key={index} className="h-5 w-5 text-[#D4B58E]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#111111]/70 font-light leading-relaxed mb-6">
                  &ldquo;Exceptional service and attention to detail. The team truly understands luxury beauty care.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[#D4B58E]/20 flex items-center justify-center">
                    <span className="text-[#D4B58E] font-semibold">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#111111]">Client Name</p>
                    <p className="text-sm text-[#111111]/50 font-light">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4B58E]/10 to-transparent"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-['Poppins'] text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-xl text-white/70 font-light mb-10 leading-relaxed">
              Book your appointment today and experience luxury beauty services that bring out your best self
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center px-12 py-5 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-xl hover:shadow-2xl"
            >
              SCHEDULE YOUR VISIT
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
