/**
 * Admin Dashboard Page
 * Shows stats and quick actions
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui/error";
import { LoadingSpinner } from "@/components/ui/loading";

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  totalServices: number;
  activeStaff: number;
  pendingBookings: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const statCards = [
    {
      label: "Today's Bookings",
      value: stats?.todayBookings || 0,
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      label: "This Week",
      value: stats?.weekBookings || 0,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Active Services",
      value: stats?.totalServices || 0,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Active Staff",
      value: stats?.activeStaff || 0,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
  ];

  const quickActions = [
    {
      title: "Add Service",
      description: "Create a new beauty service",
      href: "/admin/services/new",
      icon: "✨",
    },
    {
      title: "View Bookings",
      description: "Manage customer appointments",
      href: "/admin/bookings",
      icon: "📅",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin panel</p>
      </div>

      {/* Pending Bookings Alert */}
      {stats && stats.pendingBookings > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-900">
                {stats.pendingBookings} pending booking
                {stats.pendingBookings !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-yellow-700">
                Review and confirm customer appointments
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              View Bookings
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}
          >
            <p className="text-sm font-medium text-gray-600 mb-2">
              {stat.label}
            </p>
            <p className={`text-4xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-serif text-2xl text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{action.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors"
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
