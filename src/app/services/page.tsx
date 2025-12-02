import { ServiceCard } from "@/components/service-card";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  is_active: boolean;
  image_url?: string;
}

async function getServices() {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return (data || []) as Service[];
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="font-['Poppins'] text-5xl md:text-6xl font-semibold text-[#111111] mb-4">
            Our Services
          </h1>
          <p className="text-[#111111]/60 text-lg font-light max-w-2xl mx-auto">
            Discover our curated collection of luxury beauty and wellness treatments
          </p>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                price={service.price}
                duration={service.duration}
                category={service.category}
                image_url={service.image_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#111111]/50 text-lg">No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
