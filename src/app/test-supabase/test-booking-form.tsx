"use client";

import { useState } from "react";
import { createBooking, type Service } from "@/lib/actions/bookings";

interface TestBookingFormProps {
  services: Service[];
}

export function TestBookingForm({ services }: TestBookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const bookingData = {
      customer_name: formData.get("customer_name") as string,
      customer_email: formData.get("customer_email") as string,
      customer_phone: formData.get("customer_phone") as string,
      service_id: formData.get("service_id") as string,
      booking_date: formData.get("booking_date") as string,
      booking_time: formData.get("booking_time") as string,
      notes: formData.get("notes") as string,
    };

    const result = await createBooking(bookingData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: `Booking created successfully! ID: ${result.data?.id}`,
      });
      // Reset form
      e.currentTarget.reset();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Name */}
      <div>
        <label
          htmlFor="customer_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Customer Name *
        </label>
        <input
          type="text"
          id="customer_name"
          name="customer_name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      {/* Customer Email */}
      <div>
        <label
          htmlFor="customer_email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email *
        </label>
        <input
          type="email"
          id="customer_email"
          name="customer_email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="john@example.com"
        />
      </div>

      {/* Customer Phone */}
      <div>
        <label
          htmlFor="customer_phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone
        </label>
        <input
          type="tel"
          id="customer_phone"
          name="customer_phone"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="(123) 456-7890"
        />
      </div>

      {/* Service Selection */}
      <div>
        <label
          htmlFor="service_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Service *
        </label>
        <select
          id="service_id"
          name="service_id"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.price.toFixed(2)} ({service.duration}{" "}
              min)
            </option>
          ))}
        </select>
      </div>

      {/* Booking Date */}
      <div>
        <label
          htmlFor="booking_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date *
        </label>
        <input
          type="date"
          id="booking_date"
          name="booking_date"
          required
          min={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Booking Time */}
      <div>
        <label
          htmlFor="booking_time"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Time *
        </label>
        <input
          type="time"
          id="booking_time"
          name="booking_time"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Any special requests or notes..."
        />
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Booking..." : "Create Test Booking"}
      </button>
    </form>
  );
}
