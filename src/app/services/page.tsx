import { Container } from "@/components/container";
import { ServiceCard } from "@/components/service-card";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getServices() {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data || [];
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-white">
      <Container>
        {/* Header */}
        <div className="py-16 text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our range of luxurious beauty treatments designed to
            enhance your natural beauty
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No services available at this time.
              </p>
            </div>
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description || ""}
                price={service.price}
                duration={service.duration}
                category={service.category}
              />
            ))
          )}
        </div>
      </Container>
    </div>
  );
}
