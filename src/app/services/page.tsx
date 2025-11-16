import { Container } from "@/components/container";
import { ServiceCard } from "@/components/service-card";

// Placeholder service data
const SERVICES = [
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
  {
    id: "4",
    name: "Relaxation Massage",
    description: "Full body relaxation massage with aromatherapy",
    price: 140.0,
    duration: 90,
    category: "Spa",
  },
  {
    id: "5",
    name: "Express Manicure",
    description: "Quick and professional manicure service",
    price: 45.0,
    duration: 30,
    category: "Nails",
  },
  {
    id: "6",
    name: "Hair Coloring",
    description: "Professional hair coloring with premium products",
    price: 150.0,
    duration: 120,
    category: "Hair",
  },
];

const CATEGORIES = ["All", "Hair", "Skincare", "Makeup", "Spa", "Nails"];

export default function ServicesPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of premium beauty treatments
              designed to make you look and feel your best
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

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
