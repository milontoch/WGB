import { Container } from "@/components/container";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: December 2025</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using WGB Beauty services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Booking and Cancellations</h2>
            <p className="text-gray-700 mb-4">
              All bookings are subject to availability. Cancellations must be made at least 24 hours in advance for a full refund. 
              Late cancellations or no-shows may incur a cancellation fee.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Payment Terms</h2>
            <p className="text-gray-700 mb-4">
              Payment is required at the time of booking. We accept payments through Paystack. All prices are in your local currency 
              and include applicable taxes unless stated otherwise.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify or discontinue services without notice. Service availability may vary based on location and staff availability.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. User Conduct</h2>
            <p className="text-gray-700 mb-4">
              Users must behave respectfully towards staff and other clients. We reserve the right to refuse service to anyone 
              who violates our policies or acts inappropriately.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              WGB Beauty shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link href="/auth/register" className="text-pink-600 hover:text-pink-700 font-semibold">
                ← Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
