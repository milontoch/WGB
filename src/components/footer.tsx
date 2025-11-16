import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Beauty<span className="text-gray-900">Co</span>
            </h3>
            <p className="text-gray-600 text-sm">
              Your destination for premium beauty services and products. Elevate
              your beauty routine with us.
            </p>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Hair Styling
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Skincare
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Makeup
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Spa & Wellness
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 hover:text-primary text-sm transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>123 Beauty Street</li>
              <li>New York, NY 10001</li>
              <li className="pt-2">
                <a
                  href="tel:+1234567890"
                  className="hover:text-primary transition-colors"
                >
                  (123) 456-7890
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@beautyco.com"
                  className="hover:text-primary transition-colors"
                >
                  info@beautyco.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} BeautyCo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-gray-600 hover:text-primary text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-primary text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-primary text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
