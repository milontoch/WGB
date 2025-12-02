import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="mb-6">
              <span className="font-['Poppins'] text-2xl font-bold text-white">
                WGB
              </span>
              <span className="ml-2 text-sm text-[#D4B58E] font-light tracking-widest">BEAUTY</span>
            </div>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Your premier destination for luxury beauty treatments and wellness services. Experience excellence in every detail.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-['Poppins'] font-semibold text-white mb-6 tracking-wide">QUICK LINKS</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Store
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-['Poppins'] font-semibold text-white mb-6 tracking-wide">OUR SERVICES</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Permanent Tattoo
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Semi-Permanent Tattoo
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Brow Lamination
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Lash Extension
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Teeth Whitening
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Teeth Scaling & Polishing
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Tooth Gems
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Teeth Braces
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white/60 hover:text-[#D4B58E] text-sm font-light transition-colors"
                >
                  Semi-Permanent Brows
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-['Poppins'] font-semibold text-white mb-6 tracking-wide">CONTACT</h4>
            <ul className="space-y-3 text-sm text-white/60 font-light">
              <li className="flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 text-[#D4B58E] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Beauty Lane<br />Lagos, Nigeria</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-[#D4B58E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:+2341234567890"
                  className="hover:text-[#D4B58E] transition-colors"
                >
                  +234 123 456 7890
                </a>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-[#D4B58E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:hello@wgbbeauty.com"
                  className="hover:text-[#D4B58E] transition-colors"
                >
                  hello@wgbbeauty.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm font-light">
              © {currentYear} WGB Beauty. All rights reserved.
            </p>
            <div className="flex space-x-8">
              <Link
                href="#"
                className="text-white/40 hover:text-[#D4B58E] text-sm font-light transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-white/40 hover:text-[#D4B58E] text-sm font-light transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
