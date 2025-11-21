import { getServices, createBooking } from "@/lib/actions/bookings";
import { TestBookingForm } from "./test-booking-form";

export default async function TestSupabasePage() {
  // Fetch services from Supabase
  const { data: services, error } = await getServices();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Supabase Integration Test
          </h1>
          <p className="text-gray-600">
            This page demonstrates Supabase connectivity with your Next.js
            application.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Connection Status
          </h2>
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 font-medium">❌ Connection Error</p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
              <p className="text-red-600 text-sm mt-4">
                Make sure you&apos;ve:
                <br />
                1. Created the tables in Supabase using the SQL schema
                <br />
                2. Updated .env.local with your Supabase credentials
                <br />
                3. Restarted your Next.js development server
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 font-medium">
                ✅ Successfully connected to Supabase!
              </p>
              <p className="text-green-600 text-sm mt-2">
                Found {services?.length || 0} services in the database
              </p>
            </div>
          )}
        </div>

        {/* Services List */}
        {services && services.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <span className="text-primary font-bold">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {service.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>⏱️ {service.duration} min</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {service.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {services && services.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Booking Form
            </h2>
            <p className="text-gray-600 mb-6">
              Try creating a test booking to verify write operations.
            </p>
            <TestBookingForm services={services} />
          </div>
        )}

        {/* No Services Message */}
        {services && services.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ⚠️ No Services Found
            </h2>
            <p className="text-gray-600">
              The database is connected, but no services are available. The SQL
              schema includes sample data. Make sure you ran the complete SQL
              script in Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
