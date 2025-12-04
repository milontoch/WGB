import { Container } from "@/components/container";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <Container>
        <div className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: December 2025</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Booking and appointment information</li>
              <li>Payment information (processed securely through Paystack)</li>
              <li>Communication preferences</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Process bookings and payments</li>
              <li>Send booking confirmations and reminders</li>
              <li>Communicate with you about our services</li>
              <li>Improve our services and customer experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors (Paystack) for transaction processing</li>
              <li>Legal authorities when required by law</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate security measures to protect your personal information. However, no method of transmission 
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this privacy policy, please contact us at privacy@wgbbeauty.com
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
