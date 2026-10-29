import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

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
      className="text-slate-400 hover:text-white transition-colors"
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
    <footer className="bg-[#131921] text-white border-t border-slate-800 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Logo & Brand statement */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20">
                <Store className="w-4 h-4 text-[#febd69]" aria-hidden />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Robo<span className="text-[#febd69]">Expert</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Multiple Sellers. Endless Choices.
            </p>
          </div>

          {/* Get to Know Us */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Get to Know Us
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  Press & News
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  Investor Relations
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Help
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/track-order" className="hover:text-white hover:underline transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white hover:underline transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white hover:underline transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white hover:underline transition-colors">
                  Shipping Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Policy
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white hover:underline transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Download Our App */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              Download Our App
            </h4>
            <div className="flex flex-col gap-2.5 max-w-[150px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer text-left">
                <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.73-.93 2.76 1 .08 2.02-.51 2.64-1.26Z" />
                </svg>
                <div>
                  <p className="text-[9px] text-slate-400 leading-none">Download on the</p>
                  <p className="text-xs font-bold text-white leading-tight">App Store</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer text-left">
                <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.997 1.997 0 0 1-.61-.92L3 2.734c.033-.33.242-.644.609-.92zm11.233 11.233l2.454-2.454-11.43-6.595 8.976 9.049zm0 1.906L5.866 24.002l11.43-6.595-2.454-2.454zm1.046-1.046l3.073-1.774a1.8 1.8 0 0 0 0-3.136l-3.073-1.774-1.547 1.547 4.62 1.57-4.62 1.567 1.547 2.001z" />
                </svg>
                <div>
                  <p className="text-[9px] text-slate-400 leading-none">GET IT ON</p>
                  <p className="text-xs font-bold text-white leading-tight">Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Copyright & Socials */}
      <div className="border-t border-slate-800 bg-[#0f141a]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2025 RoboExpert. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <SocialIcon href="https://facebook.com" label="Facebook">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1Z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://youtube.com" label="YouTube">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                <path d="M23 12.2s0-3.3-.4-4.8c-.2-.9-.9-1.6-1.8-1.8C19.2 5.2 12 5.2 12 5.2s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 8.9 1 12.2 1 12.2s0 3.3.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.8.4-4.8ZM9.8 15.6V8.8l6 3.4-6 3.4Z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://x.com" label="X">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                <path d="M18.244 2H21l-6.51 7.44L22 22h-6.79l-4.32-6.33L6.2 22H3.44l6.96-7.96L2 2h6.96l3.9 5.86L18.244 2Zm-2.38 18h1.88L7.23 3.94H5.22L15.864 20Z" />
              </svg>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}
