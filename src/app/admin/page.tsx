import Link from "next/link";
import { Container } from "@/components/container";

export default function AdminPage() {
  const stats = [
    { label: "Total Bookings", value: "156", icon: "📅" },
    { label: "Active Services", value: "12", icon: "💅" },
    { label: "Products", value: "48", icon: "🛍️" },
    { label: "Revenue (MTD)", value: "$12,450", icon: "💰" },
  ];

  const quickLinks = [
    {
      title: "Manage Services",
      description: "View, add, or edit beauty services",
      href: "/admin/services",
      icon: "💆",
    },
    {
      title: "Manage Bookings",
      description: "View and manage customer appointments",
      href: "/admin/bookings",
      icon: "📋",
    },
    {
      title: "Manage Products",
      description: "Manage your product inventory",
      href: "/admin/products",
      icon: "🌸",
    },
  ];

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16 border-b border-gray-200">
        <Container>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your beauty services business
          </p>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Quick Links */}
      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="text-5xl mb-4">{link.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-600 mb-4">{link.description}</p>
                <span className="inline-flex items-center text-primary font-medium">
                  Manage
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
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Recent Activity */}
      <section className="py-12">
        <Container>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Recent Activity
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              {[
                {
                  action: "New booking",
                  detail: "Haircut by Sarah Johnson",
                  time: "5 min ago",
                },
                {
                  action: "Product sold",
                  detail: "Luxury Face Serum x2",
                  time: "1 hour ago",
                },
                {
                  action: "Booking confirmed",
                  detail: "Bridal Makeup - Emma Watson",
                  time: "2 hours ago",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.detail}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
