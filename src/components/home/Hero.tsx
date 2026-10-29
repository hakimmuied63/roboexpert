import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Store,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Heart,
  Car,
  Grid,
} from 'lucide-react';
import { useState } from 'react';
import type { Product, Category } from '../../lib/api';
import { isVisibleMarketplaceCategory } from '../../lib/marketplaceUi';

type Props = {
  products?: Product[];
  categories?: Category[];
};

// Map categories to icons
const SIDEBAR_CATEGORIES = [
  { name: 'Fashion', icon: Shirt, slug: 'clothing' },
  { name: 'Electronics', icon: Smartphone, slug: 'television' },
  { name: 'Home & Kitchen', icon: Home, slug: 'home' },
  { name: 'Beauty & Personal Care', icon: Sparkles, slug: 'beauty' },
  { name: 'Sports & Outdoors', icon: Dumbbell, slug: 'sports' },
  { name: 'Books', icon: BookOpen, slug: 'books' },
  { name: 'Toys & Games', icon: Gamepad2, slug: 'toys' },
  { name: 'Health & Wellness', icon: Heart, slug: 'health' },
  { name: 'Automotive', icon: Car, slug: 'automotive' },
];

export function Hero({ products = [], categories = [] }: Props) {
  const [slide, setSlide] = useState(0);

  // Get real visible categories from backend or fallback to mapped ones
  const realCategories = categories.filter(isVisibleMarketplaceCategory);

  // Find products with real usable images from Muied Enterprises or first seller
  const featuredProducts = products.filter(
    (p) => p.images && p.images.length > 0 && !p.images[0].includes('example.com')
  );

  const featuredSeller =
    products.find((p) => p.company?.name)?.company?.name || 'Muied Enterprises';

  const slides = [
    {
      title: 'Premium Styles for Every You',
      subtitle: 'Top brands. Great quality. Unbeatable prices.',
      buttonText: 'Shop Now →',
      link: '/search',
    },
    {
      title: 'Next-Gen Gear & Essentials',
      subtitle: 'Verified sellers with fast doorstep delivery.',
      buttonText: 'Explore Deals →',
      link: '/search?filter=trending',
    },
  ];

  const currentSlide = slides[slide % slides.length];

  return (
    <section className="max-w-7xl mx-auto px-4 pt-3 sm:pt-4" aria-label="Hero showcase">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Category Sidebar (Visible on LG screens) */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-sm p-2 flex flex-col justify-between">
          <ul className="space-y-0.5">
            {SIDEBAR_CATEGORIES.map((item) => {
              const Icon = item.icon;
              // Check if matching real category exists
              const matchedReal = realCategories.find((c) =>
                c.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
              );
              const targetSlug = matchedReal ? matchedReal.slug : item.slug;

              return (
                <li key={item.name}>
                  <Link
                    to={`/category/${targetSlug}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-medium group"
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-amber-700 transition-colors shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/search"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-medium group"
              >
                <span className="flex items-center gap-2.5">
                  <Grid className="w-4 h-4 text-slate-500 group-hover:text-amber-700 transition-colors shrink-0" />
                  <span>More Categories</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Wide Hero Banner */}
        <div className="lg:col-span-9 relative rounded-xl overflow-hidden bg-gradient-to-r from-[#dfd7cc] via-[#e8e2d8] to-[#eeeae2] border border-slate-200/80 shadow-sm min-h-[300px] sm:min-h-[340px] md:min-h-[380px] flex items-center p-6 sm:p-10">
          {/* Subtle background decoration */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#a3907c_1px,transparent_1px)] [background-size:16px_16px]"
            aria-hidden
          />

          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => setSlide((s) => (s === 0 ? slides.length - 1 : s - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => setSlide((s) => (s + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Featured Seller Badge Top Right */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
            <Link
              to="/search"
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 border border-slate-200 shadow-sm hover:shadow-md transition-all group backdrop-blur-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-tight">
                  {featuredSeller}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Featured Seller</p>
              </div>
            </Link>
          </div>

          {/* Banner Main Content */}
          <div className="relative z-10 max-w-md sm:max-w-lg">
            <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 leading-[1.12] tracking-tight mb-3">
              {currentSlide.title}
            </h1>
            <p className="text-xs sm:text-base text-slate-700 font-normal leading-relaxed mb-6 max-w-sm sm:max-w-md">
              {currentSlide.subtitle}
            </p>
            <Link
              to={currentSlide.link}
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            >
              {currentSlide.buttonText}
            </Link>
          </div>

          {/* Real Products Floating Showcase on Right (No mock images!) */}
          {featuredProducts.length > 0 && (
            <div className="hidden md:flex absolute right-12 bottom-6 top-16 items-center gap-3 pointer-events-none">
              {featuredProducts.slice(0, 2).map((prod, idx) => (
                <div
                  key={prod._id}
                  className={`w-32 lg:w-40 bg-white/90 backdrop-blur-xs rounded-xl p-2.5 shadow-md border border-slate-200/80 transition-transform ${
                    idx === 1 ? 'translate-y-4' : '-translate-y-2'
                  }`}
                >
                  <div className="aspect-square rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center p-1.5 mb-2">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 truncate">
                    {prod.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-700">
                    ₹{prod.basePrice.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
