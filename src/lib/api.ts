const API_BASE = 'http://localhost:5001';

export type Company = {
  _id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  isActive: boolean;
};

export type Product = {
  _id: string;
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  images: string[];
  isActive: boolean;
  company?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  companyId: string | null;
  parentId: string | null;
  isActive: boolean;
};

export type CatalogResponse = {
  ok: boolean;
  company: {
    _id: string;
    name: string;
    slug: string;
  };
  products: Product[];
};

export const fetchCompanyProducts = async (
  companyId: string
): Promise<CatalogResponse | null> => {
  try {
    const res = await fetch(`${API_BASE}/catalog/companies/${companyId}/products`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('fetchCompanyProducts error:', error);
    return null;
  }
};

export const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_BASE}/catalog/products`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch (error) {
    console.error('fetchAllProducts error:', error);
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch (error) {
    console.error('fetchCategories error:', error);
    return [];
  }
};
export type ProductVariant = {
    _id: string;
    productId: string;
    companyId: string;
    sku: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
    isActive: boolean;
  };
  
  export type ProductDetailResponse = {
    ok: boolean;
    product: Product;
    variants: ProductVariant[];
  };
  
  export const fetchProductById = async (
    productId: string
  ): Promise<ProductDetailResponse | null> => {
    try {
      const res = await fetch(`${API_BASE}/catalog/products/${productId}`);
      if (!res.ok) return null;
      return res.json();
    } catch (error) {
      console.error('fetchProductById error:', error);
      return null;
    }
  };