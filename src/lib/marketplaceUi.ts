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
  return `₹${amount.toLocaleString('en-IN')}`;
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
  const extra = product as Product & { rating?: number; avgRating?: number };
  const value = extra.rating ?? extra.avgRating;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  return undefined;
}

export function getReviewCount(product: Product): number | undefined {
  const extra = product as Product & { reviewCount?: number };
  if (typeof extra.reviewCount === 'number' && extra.reviewCount > 0) {
    return extra.reviewCount;
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
  return Boolean(product.images?.[0]);
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
