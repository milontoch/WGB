import Link from "next/link";
import { Container } from "@/components/container";

const SERVICES = [
  {
    id: "1",
    name: "Signature Haircut & Style",
    category: "Hair",
    price: 85.0,
    duration: 60,
    active: true,
  },
  {
    id: "2",
    name: "Deluxe Facial Treatment",
    category: "Skincare",
    price: 120.0,
    duration: 75,
    active: true,
  },
  {
    id: "3",
    name: "Bridal Makeup Package",
    category: "Makeup",
    price: 250.0,
    duration: 120,
    active: true,
  },
  {
    id: "4",
    name: "Relaxation Massage",
    category: "Spa",
    price: 140.0,
    duration: 90,
    active: true,
  },
  {
    id: "5",
    name: "Express Manicure",
    category: "Nails",
    price: 45.0,
    duration: 30,
    active: false,
  },
];

export default function AdminServicesPage() {
  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white py-8 border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-primary mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Services
              </h1>
            </div>
            <button className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
              + Add New Service
            </button>
          </div>
        </Container>
      </section>

      {/* Services Table */}
      <section className="py-12">
        <Container>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {SERVICES.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {service.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        ${service.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {service.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {service.active ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-primary/80 mr-4">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
