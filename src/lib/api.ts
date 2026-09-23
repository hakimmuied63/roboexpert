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
  createdAt: string;
  updatedAt: string;
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

export type CategoryProductsResponse = {
  ok: boolean;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  products: Product[];
};

export const fetchProductsByCategory = async (
  slug: string
): Promise<CategoryProductsResponse | null> => {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories/${slug}/products`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('fetchProductsByCategory error:', error);
    return null;
  }
};

export type CartItemForOrder = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type PlaceOrderPayload = {
  buyer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: CartItemForOrder[];
};

export type PlaceOrderResponse = {
  ok: boolean;
  orders: Array<{
    order: {
      _id: string;
      orderNumber: string;
      total: number;
      status: string;
      paymentStatus: string;
    };
    items: Array<{
      _id: string;
      productSnapshot: {
        name: string;
        image?: string;
        variantAttributes: Record<string, string>;
        sku: string;
      };
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    company: {
      _id: string;
      name: string;
      slug: string;
    };
  }>;
  message: string;
};

export const placeOrder = async (
  payload: PlaceOrderPayload
): Promise<PlaceOrderResponse | null> => {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error('placeOrder error response:', err);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('placeOrder error:', error);
    return null;
  }
};

// ---------- Company-scoped categories ----------

export const fetchCompanyCategories = async (
  companyId: string
): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE}/catalog/companies/${companyId}/categories`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch (error) {
    console.error('fetchCompanyCategories error:', error);
    return [];
  }
};

export type CompanyCategoryProductsResponse = {
  ok: boolean;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  products: Product[];
};

export const fetchProductsByCompanyCategory = async (
  companyId: string,
  categorySlug: string
): Promise<CompanyCategoryProductsResponse | null> => {
  try {
    const res = await fetch(
      `${API_BASE}/catalog/companies/${companyId}/categories/${categorySlug}/products`
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('fetchProductsByCompanyCategory error:', error);
    return null;
  }
};
export type CompanySummary = {
    _id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  
  export const fetchAllCompanies = async (): Promise<CompanySummary[]> => {
    try {
      const res = await fetch(`${API_BASE}/catalog/companies`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.companies ?? [];
    } catch (error) {
      console.error('fetchAllCompanies error:', error);
      return [];
    }
  };
  export const searchProducts = async (
    query: string,
    companyId?: string
  ): Promise<Product[]> => {
    try {
      const params = new URLSearchParams({ q: query });
      if (companyId) params.set('companyId', companyId);
  
      const res = await fetch(`${API_BASE}/catalog/products/search?${params.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.products ?? [];
    } catch (error) {
      console.error('searchProducts error:', error);
      return [];
    }
  };