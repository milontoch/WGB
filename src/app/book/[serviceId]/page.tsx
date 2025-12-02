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
  const { serviceId } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(true);

  // Fetch service details
  useEffect(() => {
    async function fetchService() {
      try {
        setServiceLoading(true);
        const res = await fetch(`/api/services/${serviceId}`);
        if (res.ok) {
          const data = await res.json();
          setService(data);
        } else {
          setError("Service not found");
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Failed to load service details");
      } finally {
        setServiceLoading(false);
      }
    }
    fetchService();
  }, [serviceId]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    async function fetchSlots() {
      try {
        const res = await fetch(
          `/api/bookings/available-slots?date=${selectedDate}&serviceId=${serviceId}`
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
  }, [selectedDate, serviceId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/book/${serviceId}`);
    }
  }, [user, authLoading, router, serviceId]);

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
          service_id: serviceId,
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

  if (authLoading || serviceLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4B58E] mx-auto"></div>
          <p className="mt-4 text-[#111111]/60 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center bg-white rounded-[18px] p-10 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="font-['Poppins'] text-3xl font-semibold text-[#111111] mb-4">
              Service Not Found
            </h2>
            <p className="text-[#111111]/60 font-light mb-8 leading-relaxed">
              {error || "The service you're looking for doesn't exist or is no longer available."}
            </p>
            <Link
              href="/services"
              className="inline-block w-full px-8 py-4 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-lg hover:shadow-xl"
            >
              BROWSE ALL SERVICES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center bg-white rounded-[18px] p-10 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
            <div className="w-20 h-20 bg-[#D4B58E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-[#D4B58E]"
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
            <h2 className="font-['Poppins'] text-3xl font-semibold text-[#111111] mb-4">
              Booking Confirmed!
            </h2>
            <p className="text-[#111111]/60 font-light mb-8 leading-relaxed">
              Your appointment has been successfully booked. Check your email
              for confirmation details.
            </p>
            <Link
              href="/booking"
              className="inline-block w-full px-8 py-4 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] transition-all shadow-lg hover:shadow-xl"
            >
              VIEW MY BOOKINGS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/services`}
            className="inline-flex items-center text-[#D4B58E] hover:text-[#C4A57E] text-sm font-medium mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Services
          </Link>
          <h1 className="font-['Poppins'] text-4xl md:text-5xl font-semibold text-[#111111] mb-2">
            Book Your Appointment
          </h1>
          <p className="text-[#111111]/60 text-lg font-light">
            {service.name}
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-[18px] p-8 md:p-10 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
              
              {/* Date Selection */}
              <div className="mb-8">
                <label htmlFor="booking-date" className="block text-sm font-semibold text-[#111111] mb-3 tracking-wide">
                  SELECT DATE *
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  min={today}
                  required
                  className="w-full px-5 py-4 border-2 border-[#111111]/10 rounded-xl focus:ring-2 focus:ring-[#D4B58E] focus:border-transparent transition-all text-[#111111] font-light"
                />
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-[#111111] mb-3 tracking-wide">
                    SELECT TIME *
                  </label>
                  {timeSlots.length === 0 ? (
                    <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#D4B58E]/20">
                      <p className="text-[#111111]/60 text-sm text-center">
                        No available slots for this date. Please select another date.
                      </p>
                    </div>
                  ) : (
                    <>
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
                                  ? "border-[#D4B58E] bg-[#D4B58E]/10 text-[#D4B58E]"
                                  : "border-[#111111]/10 hover:border-[#D4B58E]/50 text-[#111111]/70 hover:bg-[#FAF7F2]"
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                      </div>
                      {selectedSlot && (
                        <p className="mt-4 text-sm text-[#111111]/60 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-[#D4B58E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          With: <span className="font-medium text-[#111111] ml-1">{selectedSlot.staffName}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="mb-8">
                <label htmlFor="booking-notes" className="block text-sm font-semibold text-[#111111] mb-3 tracking-wide">
                  ADDITIONAL NOTES (OPTIONAL)
                </label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Any special requests or requirements..."
                  className="w-full px-5 py-4 border-2 border-[#111111]/10 rounded-xl focus:ring-2 focus:ring-[#D4B58E] focus:border-transparent resize-none transition-all text-[#111111] font-light placeholder:text-[#111111]/40"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedSlot}
                className="w-full px-8 py-5 bg-[#D4B58E] text-white text-sm font-semibold tracking-wide rounded-full hover:bg-[#C4A57E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? "CONFIRMING..." : "CONFIRM BOOKING"}
              </button>
            </form>
          </div>

          {/* Right Column - Booking Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[18px] p-8 shadow-[0_5px_20px_rgba(0,0,0,0.08)] lg:sticky lg:top-8">
              <h3 className="font-['Poppins'] text-xl font-semibold text-[#111111] mb-6 pb-4 border-b border-[#111111]/10">
                Booking Summary
              </h3>

              {/* Service Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-[#111111]/50 uppercase tracking-wide mb-1">Service</p>
                  <p className="text-[#111111] font-medium">{service.name}</p>
                </div>
                
                <div>
                  <p className="text-xs text-[#111111]/50 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-[#111111] font-light">{service.category}</p>
                </div>

                <div>
                  <p className="text-xs text-[#111111]/50 uppercase tracking-wide mb-1">Duration</p>
                  <p className="text-[#111111] font-light">{service.duration} minutes</p>
                </div>

                {selectedDate && (
                  <div>
                    <p className="text-xs text-[#111111]/50 uppercase tracking-wide mb-1">Date</p>
                    <p className="text-[#111111] font-light">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {selectedSlot && (
                  <div>
                    <p className="text-xs text-[#111111]/50 uppercase tracking-wide mb-1">Time</p>
                    <p className="text-[#111111] font-light">{selectedSlot.time}</p>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="pt-6 border-t border-[#111111]/10">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#111111]/60 font-medium">Total Price</p>
                  <p className="text-3xl font-semibold text-[#D4B58E]">
                    ₦{service.price.toLocaleString('en-NG')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
