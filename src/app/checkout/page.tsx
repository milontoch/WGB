/**
 * Checkout Page
 * Shipping form and Paystack payment initialization
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { Container } from "@/components/container";
import { LoadingSpinner } from "@/components/ui/loading";

interface CartData {
  cart: any[];
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPickup, setIsPickup] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login?redirect=/checkout");
          return;
        }
        throw new Error("Failed to load cart");
      }

      const data = await res.json();

      if (!data.cart || data.cart.length === 0) {
        router.push("/cart");
        return;
      }

      setCartData(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load cart');
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    if (!isPickup) {
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }
    
    setValidationErrors({});
    setSubmitting(true);

    try {
      // Map form data to API expected format
      const paymentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        is_pickup: isPickup,
      };

      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || 'Payment initialization failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <Container>
        <div className="py-12">
          <h1 className="font-serif text-4xl text-gray-900 mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl p-8 shadow-md"
              >
                {/* Contact Information */}
                <div className="mb-8">
                  <h2 className="font-serif text-2xl text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-semibold text-gray-900 mb-2">
                        First Name *
                      </label>
                      <input
                        id="first-name"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          });
                          if (validationErrors.firstName) {
                            setValidationErrors({ ...validationErrors, firstName: '' });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          validationErrors.firstName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#D4B58E]'
                        }`}
                      />
                      {validationErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Last Name *
                      </label>
                      <input
                        id="last-name"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData({ ...formData, lastName: e.target.value });
                          if (validationErrors.lastName) {
                            setValidationErrors({ ...validationErrors, lastName: '' });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          validationErrors.lastName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#D4B58E]'
                        }`}
                      />
                      {validationErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (validationErrors.email) {
                            setValidationErrors({ ...validationErrors, email: '' });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          validationErrors.email 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#D4B58E]'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (validationErrors.phone) {
                            setValidationErrors({ ...validationErrors, phone: '' });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                          validationErrors.phone 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#D4B58E]'
                        }`}
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pickup Option */}
                <div className="mb-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPickup}
                      onChange={(e) => setIsPickup(e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-600"
                    />
                    <span className="font-semibold text-gray-900">
                      Pickup from our location in Asaba
                    </span>
                  </label>
                </div>

                {/* Shipping Address */}
                {!isPickup && (
                  <div className="mb-8">
                    <h2 className="font-serif text-2xl text-gray-900 mb-4">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                          Street Address *
                        </label>
                        <input
                          id="address"
                          type="text"
                          required={!isPickup}
                          value={formData.address}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            });
                            if (validationErrors.address) {
                              setValidationErrors({ ...validationErrors, address: '' });
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                            validationErrors.address 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-[#D4B58E]'
                          }`}
                        />
                        {validationErrors.address && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
                            City *
                          </label>
                          <input
                            id="city"
                            type="text"
                            required={!isPickup}
                            value={formData.city}
                            onChange={(e) => {
                              setFormData({ ...formData, city: e.target.value });
                              if (validationErrors.city) {
                                setValidationErrors({ ...validationErrors, city: '' });
                              }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                              validationErrors.city 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-[#D4B58E]'
                            }`}
                          />
                          {validationErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-semibold text-gray-900 mb-2">
                            State *
                          </label>
                          <input
                            id="state"
                            type="text"
                            required={!isPickup}
                            value={formData.state}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                state: e.target.value,
                              });
                              if (validationErrors.state) {
                                setValidationErrors({ ...validationErrors, state: '' });
                              }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                              validationErrors.state 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-[#D4B58E]'
                            }`}
                          />
                          {validationErrors.state && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Processing..." : "Proceed to Payment"}
                </button>

                <p className="text-sm text-gray-600 mt-4 text-center">
                  You will be redirected to Paystack to complete your payment
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-md sticky top-24">
                <h2 className="font-serif text-2xl text-gray-900 mb-6">
                  Order Summary
                </h2>

                {cartData && (
                  <>
                    <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
                      {cartData.cart.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {item.product.name} x {item.quantity}
                          </span>
                          <span className="text-gray-900 font-semibold">
                            ₦
                            {(
                              (item.product.discount_price ||
                                item.product.price) * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{cartData.subtotal.toLocaleString()}</span>
                      </div>
                      {cartData.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₦{cartData.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                          <span>Total</span>
                          <span>₦{cartData.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
