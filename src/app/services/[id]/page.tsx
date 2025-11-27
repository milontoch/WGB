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
    <div className="pt-16">
      {/* Breadcrumb & Back */}
      <section className="bg-gray-50 py-6 border-b border-gray-200">
        <Container>
          <Link
            href="/services"
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
            Back to Services
          </Link>
        </Container>
      </section>

      {/* Service Details */}
      <section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-purple-200 flex items-center justify-center">
              <span className="text-8xl">💇</span>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
                  {service.category}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {service.name}
                </h1>
                <p className="text-xl text-gray-600">{service.description}</p>
              </div>

              <div className="flex items-center gap-8 py-6 border-y border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-3xl font-bold text-primary">
                    ${service.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {service.duration} min
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What&apos;s Included:
                </h3>
                <ul className="space-y-2">
                  {service.includes.map((item: string, index: number) => (
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
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-lg"
                >
                  Book This Service
                </Link>
              </div>
            </div>
          </div>

          {/* Long Description */}
          <div className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About This Service
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {service.longDescription}
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
