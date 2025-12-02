"use client";

/**
 * Admin Notifications Dashboard
 * View email logs, send promotional emails, and monitor notification status
 */

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";

interface EmailLog {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message?: string;
  retry_count: number;
  sent_at?: string;
  created_at: string;
  campaign_id?: string;
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  retrying: number;
  successRate: number;
  byType: Record<string, number>;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "send" | "stats">("logs");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters for email logs
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Promotional email form
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [sending, setSending] = useState(false);

  // Fetch email logs (memoized)
  const fetchEmailLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filterType) params.append("email_type", filterType);
      if (filterStatus) params.append("status", filterStatus);
      params.append("include_stats", "true");

      const response = await fetch(
        `/api/admin/notifications/email-logs?${params}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch email logs");
      }

      setEmailLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  // Send promotional email
  const sendPromotionalEmail = async () => {
    if (!subject || !heading || !message) {
      setError("Please fill in all required fields");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const campaignId = `promo_${Date.now()}`;

      const response = await fetch(
        "/api/admin/notifications/send-promotional",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            heading,
            message,
            ctaText: ctaText || undefined,
            ctaLink: ctaLink || undefined,
            discountCode: discountCode || undefined,
            targetAudience,
            campaignId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send promotional email");
      }

      setSuccess(
        `Successfully sent ${data.emails_sent} emails to ${data.total_recipients} recipients`
      );

      // Reset form
      setSubject("");
      setHeading("");
      setMessage("");
      setCtaText("");
      setCtaLink("");
      setDiscountCode("");

      // Refresh logs
      fetchEmailLogs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Test booking reminders
  const testBookingReminders = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/cron/test-reminder", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reminders");
      }

      setSuccess(
        `Sent ${data.reminders_sent} reminders out of ${data.total_bookings} bookings`
      );
      fetchEmailLogs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, [fetchEmailLogs]);

  return (
    <Container className="py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-playfair text-4xl font-bold mb-8">
          Notifications & Email Management
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "logs"
                ? "border-b-2 border-pink-600 text-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Email Logs
          </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "send"
                ? "border-b-2 border-pink-600 text-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Send Promotional Email
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "stats"
                ? "border-b-2 border-pink-600 text-pink-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Email Logs Tab */}
        {activeTab === "logs" && (
          <div>
            <div className="mb-6 flex gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter by notification type"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Types</option>
                <option value="booking_reminder">Booking Reminders</option>
                <option value="booking_reschedule">Booking Reschedules</option>
                <option value="booking_cancellation">
                  Booking Cancellations
                </option>
                <option value="order_confirmation">Order Confirmations</option>
                <option value="payment_failure">Payment Failures</option>
                <option value="promotional">Promotional</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by notification status"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="retrying">Retrying</option>
              </select>

              <button
                onClick={fetchEmailLogs}
                disabled={loading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                onClick={testBookingReminders}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Test Booking Reminders
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-pink-50 border-b border-pink-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No email logs found
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {log.email_type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.recipient_email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.subject}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                log.status === "sent"
                                  ? "bg-green-100 text-green-800"
                                  : log.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : log.status === "retrying"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {log.status}
                              {log.retry_count > 0 && ` (${log.retry_count})`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              log.sent_at || log.created_at
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Send Promotional Email Tab */}
        {activeTab === "send" && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="font-playfair text-2xl font-bold mb-6">
              Send Promotional Email
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="target-audience" className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Audience *
                </label>
                <select
                  id="target-audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  <option value="customers">
                    Customers (Users with Orders)
                  </option>
                  <option value="booking_users">Booking Users</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Special Offer: 20% Off All Services!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Heading *
                </label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g., Exclusive Offer Just for You!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your promotional message here. You can use HTML formatting."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="e.g., SAVE20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g., Book Now"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Button Link (Optional)
                </label>
                <input
                  type="url"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="e.g., https://modernbeautystudio.com/services"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                onClick={sendPromotionalEmail}
                disabled={sending || !subject || !heading || !message}
                className="w-full py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Promotional Email"}
              </button>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Total Emails
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Success Rate
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Failed Emails
              </h3>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Emails by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {type.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status Breakdown
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.sent}
                  </p>
                  <p className="text-sm text-gray-600">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.retrying}
                  </p>
                  <p className="text-sm text-gray-600">Retrying</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.pending}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
