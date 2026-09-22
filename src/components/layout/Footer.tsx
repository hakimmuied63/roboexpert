import { Link } from 'react-router-dom';
import { Store, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                roboexpert<span className="text-primary-400">.in</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed mb-4">
              India's open marketplace connecting buyers and sellers. Anyone can sell, everyone can buy. Direct payments, zero hassle.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:support@roboexpert.in" className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                support@roboexpert.in
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </a>
              <p className="flex items-center gap-2 text-surface-400">
                <MapPin className="w-4 h-4" />
                Bangalore, India
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-surface-400 hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link to="/category/electronics" className="text-surface-400 hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/category/fashion" className="text-surface-400 hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/category/home-living" className="text-surface-400 hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/category/sports" className="text-surface-400 hover:text-white transition-colors">Sports & Fitness</Link></li>
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Sellers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/seller/signup" className="text-surface-400 hover:text-white transition-colors">Start Selling</Link></li>
              <li><Link to="/seller" className="text-surface-400 hover:text-white transition-colors">Seller Dashboard</Link></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Seller Guidelines</a></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Payment & Payouts</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Help & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-surface-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} Roboexpert.in — The Open Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-surface-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
