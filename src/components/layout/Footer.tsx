import { Link } from 'react-router-dom';
import { Store, Mail, Phone, CreditCard } from 'lucide-react';

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:-translate-y-0.5 transition-all duration-200"
      aria-label={label}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#14122B] text-white/70 border-t border-white/10 mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Logo & Brand statement */}
          <div className="lg:col-span-2 pr-0 lg:pr-8">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#4F46FF] to-[#7A5CFF] flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
                <Store className="w-5 h-5" aria-hidden />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-white">
                roboexpert<span className="text-[#4F46FF]">.in</span>
              </span>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-sm">
              India’s open marketplace. Buy what you love, sell what you make with direct payments, zero lock-in, and curated trust.
            </p>

            <div className="flex items-center gap-2.5">
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
                  <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
                  <path d="M18.244 2H21l-6.51 7.44L22 22h-6.79l-4.32-6.33L6.2 22H3.44l6.96-7.96L2 2h6.96l3.9 5.86L18.244 2Zm-2.38 18h1.88L7.23 3.94H5.22L15.864 20Z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
                  <path d="M23 12.2s0-3.3-.4-4.8c-.2-.9-.9-1.6-1.8-1.8C19.2 5.2 12 5.2 12 5.2s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.9 1 12.2 1 12.2s0 3.3.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.8.4-4.8ZM9.8 15.6V8.8l6 3.4-6 3.4Z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-display mb-4">
              Shop
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors duration-150">
                  All products
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-white/70 hover:text-white transition-colors duration-150">
                  Search & browse
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-white/70 hover:text-white transition-colors duration-150">
                  Your wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-white/70 hover:text-white transition-colors duration-150">
                  Shopping cart
                </Link>
              </li>
              <li>
                <Link to="/search?filter=trending" className="text-white/70 hover:text-white transition-colors duration-150">
                  Trending picks
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-display mb-4">
              Sell
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/seller/signup" className="text-[#FF8A3D] font-semibold hover:text-white transition-colors duration-150">
                  Start selling →
                </Link>
              </li>
              <li>
                <Link to="/seller" className="text-white/70 hover:text-white transition-colors duration-150">
                  Seller dashboard
                </Link>
              </li>
              <li>
                <Link to="/seller/products/bulk" className="text-white/70 hover:text-white transition-colors duration-150">
                  Bulk product upload
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors duration-150">
                  Seller sign in
                </Link>
              </li>
              <li>
                <Link to="/seller/settings" className="text-white/70 hover:text-white transition-colors duration-150">
                  Store policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-display mb-4">
              Help
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/track-order" className="text-white/70 hover:text-white transition-colors duration-150">
                  Track your order
                </Link>
              </li>
              <li>
                <a href="mailto:support@roboexpert.in" className="text-white/70 hover:text-white transition-colors duration-150">
                  Help centre & FAQs
                </a>
              </li>
              <li>
                <a href="mailto:support@roboexpert.in" className="text-white/70 hover:text-white transition-colors duration-150">
                  Returns & refunds
                </a>
              </li>
              <li>
                <a href="mailto:support@roboexpert.in" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors duration-150">
                  <Mail className="w-3.5 h-3.5" />
                  support@roboexpert.in
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors duration-150">
                  <Phone className="w-3.5 h-3.5" />
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with payment pills and copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50 text-center sm:text-left">
            © {new Date().getFullYear()} Roboexpert.in — The Open Marketplace. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/70">
            <CreditCard className="w-4 h-4 text-white/50 mr-1" aria-hidden />
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">UPI</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Visa</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Mastercard</span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">RuPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
