import Link from "next/link";
import { Container } from "@/components/container";

interface ServiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Placeholder service data (in real app, fetch from database)
const SERVICE_DATA: Record<string, any> = {
  "1": {
    id: "1",
    name: "Signature Haircut & Style",
    description:
      "Experience our signature haircut service performed by our expert stylists. This comprehensive treatment includes a consultation, precision haircut, and professional styling tailored to your unique features and lifestyle.",
    longDescription:
      "Our signature haircut service is more than just a trim. We begin with an in-depth consultation to understand your hair type, face shape, and lifestyle needs. Our expert stylists use advanced cutting techniques to create a look that complements your features and is easy to maintain. The service includes a relaxing shampoo with premium products, precision cutting, and a complete blow-dry and style. We'll also provide personalized advice on how to maintain your new look at home.",
    price: 85.0,
    duration: 60,
    category: "Hair",
    includes: [
      "Personal consultation",
      "Shampoo with premium products",
      "Precision haircut",
      "Professional styling",
      "Styling tips and recommendations",
    ],
  },
};

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { id } = await params;
  const service = SERVICE_DATA[id] || SERVICE_DATA["1"];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Breadcrumb & Back */}
      <section className="pt-28 pb-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link
            href="/services"
            className="inline-flex items-center text-[#D4B58E] hover:text-[#C4A57E] transition-colors text-sm font-medium"
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
            BACK TO SERVICES
          </Link>
        </div>
      </section>

      {/* Service Details */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square rounded-[24px] bg-gradient-to-br from-[#D4B58E]/20 via-[#FAF7F2] to-[#D4B58E]/10 flex items-center justify-center shadow-[0_10px_40px_rgba(212,181,142,0.15)]">
              <span className="text-8xl">💇</span>
            </div>

            {/* Details */}
            <div className="space-y-6 bg-white rounded-[24px] p-10 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
              <div>
                <span className="inline-block px-4 py-2 text-xs font-semibold bg-[#D4B58E]/10 text-[#D4B58E] rounded-full mb-6 tracking-wide">
                  {service.category.toUpperCase()}
                </span>
                <h1 className="font-['Poppins'] text-4xl font-bold text-[#111111] mb-4">
                  {service.name}
                </h1>
                <p className="text-lg text-[#111111]/70 font-light leading-relaxed">{service.description}</p>
              </div>

              <div className="flex items-center gap-12 py-8 border-y border-[#111111]/10">
                <div>
                  <p className="text-xs text-[#111111]/50 mb-2 uppercase tracking-wide">Price</p>
                  <p className="text-4xl font-bold text-[#D4B58E]">
                    ₦{service.price.toLocaleString('en-NG')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#111111]/50 mb-2 uppercase tracking-wide">Duration</p>
                  <p className="text-2xl font-semibold text-[#111111]">
                    {service.duration} min
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-['Poppins'] text-lg font-semibold text-[#111111] mb-4">
                  What&apos;s Included:
                </h3>
                <ul className="space-y-3">
                  {service.includes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-[#D4B58E] mr-3 flex-shrink-0"
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
                      <span className="text-[#111111]/70 font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={`/book/${service.id}`}
                  className="inline-flex items-center justify-center w-full px-8 py-5 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-lg hover:shadow-xl"
                >
                  BOOK THIS SERVICE
                </Link>
              </div>
            </div>
          </div>

          {/* Long Description */}
          <div className="mt-16 bg-white rounded-[24px] p-12 shadow-[0_5px_20px_rgba(0,0,0,0.08)] max-w-5xl mx-auto">
            <h2 className="font-['Poppins'] text-3xl font-semibold text-[#111111] mb-6">
              About This Service
            </h2>
            <p className="text-[#111111]/70 font-light leading-relaxed text-lg">
              {service.longDescription}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
