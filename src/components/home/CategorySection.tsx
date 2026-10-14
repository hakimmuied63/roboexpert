import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '../../lib/api';

type Props = {
  categories?: Category[];
};

// Curated high quality product/fashion/lifestyle photography mapped by category keywords
const CATEGORY_IMAGES: { test: RegExp; image: string }[] = [
  {
    test: /sneaker|shoe|boot|footwear|sandals|running/i,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /formal|suit|blazer/i,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /ethnic|traditional/i,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /sport|active|gym|fitness/i,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /bottom|denim|pant|jean/i,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /access|watch|jewel|bag/i,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /winter|jacket|coat/i,
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /top|shirt|tshirt/i,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /tech|electron|gadget/i,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
  },
  {
    test: /home|decor|living/i,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&auto=format&fit=crop&q=80',
  },
];

const DEFAULT_TILES = [
  {
    name: 'Sneakers & Kicks',
    slug: 'sneakers',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ethnic & Festive',
    slug: 'ethnic-wear',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Formal & Casuals',
    slug: 'formal',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sports & Activewear',
    slug: 'sportswear',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Smart Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Winter Essentials',
    slug: 'winter-wear',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=700&auto=format&fit=crop&q=80',
  },
];

function getCategoryImage(name: string, index: number) {
  const match = CATEGORY_IMAGES.find((c) => c.test.test(name));
  if (match) return match.image;
  return DEFAULT_TILES[index % DEFAULT_TILES.length].image;
}

export function CategorySection({ categories = [] }: Props) {
  // Use loaded categories or curated defaults if empty
  const items = categories.length > 0
    ? categories.slice(0, 6).map((c, i) => ({
        name: c.name,
        slug: c.slug,
        image: getCategoryImage(c.name, i),
      }))
    : DEFAULT_TILES;

  return (
    <section className="max-w-7xl mx-auto px-4" aria-labelledby="shop-by-category-title">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#4F46FF] block mb-1">
            Curated Collections
          </span>
          <h2
            id="shop-by-category-title"
            className="text-2xl sm:text-3xl font-extrabold font-display text-[#14122B] tracking-tight"
          >
            Shop by category
          </h2>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-[#E6E6F0] bg-white text-xs sm:text-sm font-semibold text-[#14122B] hover:border-[#4F46FF] hover:text-[#4F46FF] hover:bg-[#EEF0FF] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
        >
          Explore all
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Photo tiles (3:4) with bottom dark gradient, name and arrow button */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
        {items.map((cat) => (
          <Link
            key={cat.slug}
            to={`/category/${cat.slug}`}
            className="group relative aspect-[3/4] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-surface-200 border border-[#E6E6F0] shadow-card transition-all duration-300 hover:-translate-y-[6px] hover:shadow-card-hover block cursor-pointer"
          >
            {/* Photo with zoom 1.06 on hover */}
            <img
              src={cat.image}
              alt={cat.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />

            {/* Bottom dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#14122B] via-[#14122B]/40 to-transparent" />

            {/* Bottom content: name and arrow button */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-2 z-10">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF8A3D] block mb-0.5">
                  Explore
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-[#FF8A3D] transition-colors leading-snug line-clamp-2">
                  {cat.name}
                </h3>
              </div>

              {/* Arrow button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#14122B] group-hover:scale-110 transition-all duration-200 shadow-md">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
