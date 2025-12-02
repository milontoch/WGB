/**
 * Admin Bookings Management Page
 * View and manage all bookings with filters
 */

"use client";

import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/ui/error";
import { LoadingSpinner } from "@/components/ui/loading";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customer_name: string;
  customer_email: string;
  notes?: string;
  service?: { name: string };
  staff?: { name: string };
  user?: { full_name: string; email: string };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        const res = await fetch(`/api/admin/bookings?${params}`);
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        setBookings(data.bookings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this booking?`)) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update booking");

      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === id ? { ...b, status: newStatus as any } : b
        )
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-600">Manage customer appointments</p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error */}
      {error && <ErrorMessage message={error} />}

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
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
                    Staff
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
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
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.user?.full_name || booking.customer_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.user?.email || booking.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.service?.name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.staff?.name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.booking_time}
                      </div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          disabled={updatingId === booking.id}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50 font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          disabled={updatingId === booking.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => updateStatus(booking.id, "completed")}
                          disabled={updatingId === booking.id}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50 font-medium"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
