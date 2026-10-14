import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Cpu,
  Shirt,
  Home,
  Dumbbell,
  Sparkles,
  BookOpen,
  ShoppingBasket,
  Watch,
  Baby,
  Sofa,
  Smartphone,
  Tag,
  ChevronDown,
} from 'lucide-react';
import type { Category } from '../../lib/api';
import { groupCategories } from '../../lib/marketplaceUi';

const ICON_MAP: { test: RegExp; icon: typeof Tag }[] = [
  { test: /electron|gadget|phone|mobile|laptop|tech/i, icon: Cpu },
  { test: /fashion|apparel|cloth|wear|shirt|bottom/i, icon: Shirt },
  { test: /home|living|kitchen|decor/i, icon: Home },
  { test: /sport|fitness|gym/i, icon: Dumbbell },
  { test: /beauty|makeup|care|cosmetic/i, icon: Sparkles },
  { test: /book|stationery/i, icon: BookOpen },
  { test: /groc|food|pantry/i, icon: ShoppingBasket },
  { test: /watch|jewel|access/i, icon: Watch },
  { test: /baby|kid|toy/i, icon: Baby },
  { test: /furn|sofa/i, icon: Sofa },
  { test: /smart/i, icon: Smartphone },
];

export function categoryIcon(name: string) {
  return ICON_MAP.find((entry) => entry.test.test(name))?.icon ?? Tag;
}

type Props = {
  categories: Category[];
};

export function CategoryStrip({ categories }: Props) {
  const { roots, childrenByParent } = groupCategories(categories);
  const [openId, setOpenId] = useState<string | null>(null);

  if (roots.length === 0) return null;

  return (
    <nav
      aria-label="Shop by category"
      className="bg-white/90 backdrop-blur-md border-b border-[#E6E6F0] shadow-[0_2px_8px_rgba(20,18,43,0.02)]"
    >
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
          {roots.map((cat) => {
            const Icon = categoryIcon(cat.name);
            const children = childrenByParent.get(cat._id) ?? [];
            const hasChildren = children.length > 0;

            return (
              <li
                key={cat._id}
                className="relative shrink-0"
                onMouseEnter={() => hasChildren && setOpenId(cat._id)}
                onMouseLeave={() => setOpenId(null)}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-[#14122B] border border-[#E6E6F0] hover:border-[#4F46FF] hover:bg-[#EEF0FF] hover:text-[#4F46FF] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 whitespace-nowrap shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-[#4F46FF]" aria-hidden />
                  {cat.name}
                  {hasChildren && <ChevronDown className="w-3 h-3 text-surface-400" />}
                </Link>
                {hasChildren && openId === cat._id && (
                  <div className="hidden md:block absolute left-0 top-full pt-2 z-50">
                    <ul className="min-w-52 bg-white rounded-2xl border border-[#E6E6F0] shadow-card-hover p-1.5 animate-in fade-in zoom-in-95 duration-150">
                      {children.map((child) => (
                        <li key={child._id}>
                          <Link
                            to={`/category/${child.slug}`}
                            className="block px-3.5 py-2 text-xs sm:text-sm font-medium text-[#14122B] rounded-xl hover:bg-[#F4F3FB] hover:text-[#4F46FF] transition-colors duration-150"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
