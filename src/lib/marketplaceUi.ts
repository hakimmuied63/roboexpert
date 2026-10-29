import type { Category, Product } from './api';

const JUNK_CATEGORY = /^(test(\s+cat(egory)?)?|tops|untitled|asdf|foo|bar)$/i;

export function isVisibleMarketplaceCategory(cat: Category): boolean {
  const name = cat.name?.trim() ?? '';
  if (!name) return false;
  if (JUNK_CATEGORY.test(name)) return false;
  if (/test/i.test(name) || /test/i.test(cat.slug ?? '')) return false;
  return cat.isActive !== false;
}

export function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
}

export function getPublicSiteOrigin(): string {
  const envUrl = String(import.meta.env.VITE_PUBLIC_SITE_URL ?? '').trim();
  const fallback =
    typeof window !== 'undefined' ? window.location.origin : '';
  const raw = (envUrl || fallback).replace(/\/+$/, '');

  try {
    const url = new URL(raw);
    const host = url.hostname;
    const isLocal =
      host === 'localhost' || host === '127.0.0.1' || host === '::1';
    if (!isLocal) {
      url.protocol = 'https:';
    }
    return url.origin;
  } catch {
    return raw;
  }
}

export function getShopUrl(storeSlug: string): string {
  const slug = storeSlug.replace(/^\/+|\/+$/g, '');
  return `${getPublicSiteOrigin()}/shop/${slug}`;
}

export function getCompareAtPrice(product: Product): number | undefined {
  const extra = product as Product & { compareAtPrice?: number; mrp?: number };
  const value = extra.compareAtPrice ?? extra.mrp;
  if (typeof value === 'number' && Number.isFinite(value) && value > product.basePrice) {
    return value;
  }
  return undefined;
}

export function getDiscountPercent(product: Product): number | undefined {
  const compare = getCompareAtPrice(product);
  if (!compare) return undefined;
  return Math.round(((compare - product.basePrice) / compare) * 100);
}

export function getProductRating(product: Product): number | undefined {
  const extra = product as Product & {
    rating?: number;
    avgRating?: number;
    ratingAverage?: number;
  };
  const value = extra.ratingAverage ?? extra.rating ?? extra.avgRating;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  return undefined;
}

export function getReviewCount(product: Product): number | undefined {
  const extra = product as Product & {
    reviewCount?: number;
    ratingCount?: number;
  };
  const count = extra.ratingCount ?? extra.reviewCount;
  if (typeof count === 'number' && count > 0) {
    return count;
  }
  return undefined;
}

export function isNewProduct(product: Product, withinDays = 21): boolean {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < withinDays * 24 * 60 * 60 * 1000;
}

export function hasUsableImage(product: Product): boolean {
  const img = product.images?.[0];
  if (!img) return false;
  if (img.includes('example.com')) return false;
  return true;
}

export function groupCategories(categories: Category[]) {
  const byId = new Map(categories.map((c) => [c._id, c]));
  const childrenByParent = new Map<string, Category[]>();

  for (const cat of categories) {
    if (cat.parentId && byId.has(cat.parentId)) {
      const list = childrenByParent.get(cat.parentId) ?? [];
      list.push(cat);
      childrenByParent.set(cat.parentId, list);
    }
  }

  const roots = categories.filter(
    (cat) => !cat.parentId || !byId.has(cat.parentId)
  );

  return { roots, childrenByParent };
}
