import { Container } from "@/components/container";
import Link from "next/link";

export default function BookingPage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Book an Appointment
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select a service and choose your preferred date and time
            </p>
          </div>
        </Container>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto">
            <form className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              {/* Service Selection */}
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Service *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a service</option>
                  <option value="1">
                    Signature Haircut & Style - $85.00 (60 min)
                  </option>
                  <option value="2">
                    Deluxe Facial Treatment - $120.00 (75 min)
                  </option>
                  <option value="3">
                    Bridal Makeup Package - $250.00 (120 min)
                  </option>
                  <option value="4">
                    Relaxation Massage - $140.00 (90 min)
                  </option>
                  <option value="5">Express Manicure - $45.00 (30 min)</option>
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Preferred Time *
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Customer Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Special Requests or Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Any special requests or preferences..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors shadow-lg"
                >
                  Confirm Booking
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                By booking, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms & Conditions
                </Link>
              </p>
            </form>
          </div>
        </Container>
      </section>
    </div>
  );
}
