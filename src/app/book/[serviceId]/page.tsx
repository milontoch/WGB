"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";
import { useAuth } from "@/contexts/auth-context";

interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export default function BookingPage({
  params,
}: {
  params: { serviceId: string };
}) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch service details
  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${params.serviceId}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        }
      } catch (err) {
        console.error("Error fetching service:", err);
      }
    }
    fetchService();
  }, [params.serviceId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    async function fetchSlots() {
      try {
        const res = await fetch(
          `/api/bookings/available-slots?date=${selectedDate}&serviceId=${params.serviceId}`
        );
        if (res.ok) {
          const data = await res.json();
          setTimeSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    }
    fetchSlots();
  }, [selectedDate, params.serviceId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/book/${params.serviceId}`);
    }
  }, [user, authLoading, router, params.serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedSlot || !selectedSlot.staffId) {
      setError("Please select a time slot");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: params.serviceId,
          staff_id: selectedSlot.staffId,
          booking_date: selectedDate,
          booking_time: selectedSlot.time,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/booking");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (authLoading || !service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Container>
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
            <h2 className="font-serif text-3xl text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked. Check your email
              for confirmation details.
            </p>
            <Link
              href="/booking"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              View My Bookings
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/services/${params.serviceId}`}
              className="text-pink-600 hover:text-pink-700 text-sm mb-2 inline-block"
            >
              ← Back to Service
            </Link>
            <h1 className="font-serif text-4xl text-gray-900 mb-2">
              Book Appointment
            </h1>
            <p className="text-gray-600">{service.name}</p>
          </div>

          {/* Booking Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-8"
          >
            {/* Service Summary */}
            <div className="mb-8 p-6 bg-pink-50 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600">{service.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-pink-600">
                    ${service.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {service.duration} min
                  </p>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                min={today}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Time *
                </label>
                {timeSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-xl">
                    No available slots for this date. Please select another
                    date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots
                      .filter((slot) => slot.available)
                      .map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                            selectedSlot?.time === slot.time
                              ? "border-pink-600 bg-pink-50 text-pink-700"
                              : "border-gray-200 hover:border-pink-300 text-gray-700"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                  </div>
                )}
                {selectedSlot && (
                  <p className="mt-2 text-sm text-gray-600">
                    With:{" "}
                    <span className="font-medium">
                      {selectedSlot.staffName}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any special requests or requirements..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedSlot}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-medium rounded-xl hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
