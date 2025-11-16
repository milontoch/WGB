import Link from "next/link";
import { Container } from "@/components/container";

const BOOKINGS = [
  {
    id: "1",
    customer: "Sarah Johnson",
    service: "Signature Haircut & Style",
    date: "2025-11-20",
    time: "10:00 AM",
    status: "confirmed",
    email: "sarah@example.com",
  },
  {
    id: "2",
    customer: "Emma Watson",
    service: "Bridal Makeup Package",
    date: "2025-11-22",
    time: "2:00 PM",
    status: "pending",
    email: "emma@example.com",
  },
  {
    id: "3",
    customer: "Michael Chen",
    service: "Relaxation Massage",
    date: "2025-11-18",
    time: "3:00 PM",
    status: "completed",
    email: "michael@example.com",
  },
];

export default function AdminBookingsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                Manage Bookings
              </h1>
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                <option>All Status</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </Container>
      </section>

      {/* Bookings Table */}
      <section className="py-12">
        <Container>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
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
                  {BOOKINGS.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {booking.customer}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{booking.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {booking.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-primary hover:text-primary/80 mr-4">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-800 mr-4">
                          Confirm
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Cancel
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
