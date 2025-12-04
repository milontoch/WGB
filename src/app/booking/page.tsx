"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";
import { useAuth } from "@/contexts/auth-context";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  };
  staff: {
    id: string;
    name: string;
    role: string;
  };
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/booking");
    }
  }, [user, authLoading, router]);

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;

      try {
        const res = await fetch("/api/bookings/my-bookings");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        } else {
          setError("Failed to load bookings");
        }
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isPastBooking = (dateStr: string, timeStr: string) => {
    const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
    return bookingDateTime < new Date();
  };

  const canCancel = (booking: Booking) => {
    return (
      booking.status !== "cancelled" &&
      booking.status !== "completed" &&
      !isPastBooking(booking.booking_date, booking.booking_time)
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">View and manage your appointments</p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold whitespace-nowrap"
            >
              Book New Service
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-6">
                Book your first appointment to get started
              </p>
              <Link
                href="/services"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Booked{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Service Info */}
                    <h3 className="font-serif text-2xl text-gray-900 mb-1">
                      {booking.service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {booking.service.category}
                    </p>

                    {/* Booking Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-pink-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Date & Time
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(booking.booking_date)}
                        </p>
                        <p className="text-sm text-pink-700">
                          {formatTime(booking.booking_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Staff Member
                        </p>
                        <p className="font-medium text-gray-900">
                          {booking.staff.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.staff.role}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Duration</p>
                        <p className="font-medium text-gray-900">
                          {booking.service.duration} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Price</p>
                        <p className="font-medium text-pink-600">
                          ${booking.service.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        href={`/services/${booking.service.id}`}
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        View Service
                      </Link>
                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === booking.id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
