/**
 * Order History Page
 * Displays user's past orders
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/container";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error";

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  payment_status: string;
  order_status: string;
  is_pickup: boolean;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?redirect=/orders");
          return;
        }
        throw new Error("Failed to load orders");
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <Container>
        <div className="py-12">
          <h1 className="font-serif text-4xl text-gray-900 mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center shadow-md">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="font-serif text-3xl text-gray-900 mb-4">
                No orders yet
              </h2>
              <p className="text-gray-600 mb-8">
                Start shopping to see your orders here!
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="px-8 py-4 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          ₦{order.total_amount.toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-medium text-gray-900">
                          {order.customer_name}
                        </p>
                        <p className="text-gray-600">{order.customer_email}</p>
                        <p className="text-gray-600">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {order.is_pickup
                            ? "Pickup Location"
                            : "Delivery Address"}
                        </p>
                        {order.is_pickup ? (
                          <p className="font-medium text-gray-900">
                            Our Location in Asaba
                          </p>
                        ) : (
                          <p className="font-medium text-gray-900">
                            {order.shipping_address}
                            <br />
                            {order.shipping_city}, {order.shipping_state}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Details Button */}
                  <button
                    onClick={() => toggleOrderDetails(order.id)}
                    className="w-full p-4 text-pink-600 hover:bg-pink-50 transition-colors font-medium text-sm"
                  >
                    {expandedOrders.has(order.id)
                      ? "▲ Hide Order Details"
                      : "▼ View Order Details"}
                  </button>

                  {/* Order Items (Collapsible) */}
                  {expandedOrders.has(order.id) && (
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.product_name}
                              </p>
                              {item.product_sku && (
                                <p className="text-sm text-gray-600">
                                  SKU: {item.product_sku}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-gray-900">
                                {item.quantity} x ₦
                                {item.unit_price.toLocaleString()}
                              </p>
                              <p className="font-semibold text-gray-900">
                                ₦{item.total_price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>₦{order.subtotal.toLocaleString()}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>
                              -₦{order.discount_amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span>₦{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
