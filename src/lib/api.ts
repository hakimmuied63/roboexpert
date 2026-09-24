const API_BASE = 'http://localhost:5001';
const TOKEN_KEY = 'roboexpert_token';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const authFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...getAuthHeaders(),
    },
  });
};

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
  // ---------- Admin API ----------

export type AdminStats = {
    companies: number;
    activeCompanies: number;
    products: number;
    orders: number;
    users: number;
    revenue: number;
    ordersByStatus: Array<{ _id: string; count: number }>;
  };
  
  export const fetchAdminStats = async (): Promise<AdminStats | null> => {
    try {
      const res = await authFetch(`${API_BASE}/admin/stats`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.stats ?? null;
    } catch (error) {
      console.error('fetchAdminStats error:', error);
      return null;
    }
  };
  
  export type AdminCompany = {
    _id: string;
    name: string;
    slug: string;
    ownerUserId: string;
    contactEmail: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  
  export const fetchAdminCompanies = async (): Promise<AdminCompany[]> => {
    try {
      const res = await authFetch(`${API_BASE}/admin/companies`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.companies ?? [];
    } catch (error) {
      console.error('fetchAdminCompanies error:', error);
      return [];
    }
  };
  
  export const toggleAdminCompanyStatus = async (
    companyId: string
  ): Promise<boolean> => {
    try {
      const res = await authFetch(
        `${API_BASE}/admin/companies/${companyId}/toggle-status`,
        { method: 'PATCH' }
      );
      return res.ok;
    } catch (error) {
      console.error('toggleAdminCompanyStatus error:', error);
      return false;
    }
  };
  
  export const fetchAdminProducts = async (): Promise<Product[]> => {
    try {
      const res = await authFetch(`${API_BASE}/admin/products`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.products ?? [];
    } catch (error) {
      console.error('fetchAdminProducts error:', error);
      return [];
    }
  };
  
  export const toggleAdminProductStatus = async (
    productId: string
  ): Promise<boolean> => {
    try {
      const res = await authFetch(
        `${API_BASE}/admin/products/${productId}/toggle-status`,
        { method: 'PATCH' }
      );
      return res.ok;
    } catch (error) {
      console.error('toggleAdminProductStatus error:', error);
      return false;
    }
  };
  
  export const deleteAdminProduct = async (productId: string): Promise<boolean> => {
    try {
      const res = await authFetch(`${API_BASE}/admin/products/${productId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      console.error('deleteAdminProduct error:', error);
      return false;
    }
  };
  
  export type AdminOrder = {
    _id: string;
    companyId: string;
    orderNumber: string;
    buyer: { name: string; email: string; phone: string };
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    subtotal: number;
    shippingFee: number;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export const fetchAdminOrders = async (): Promise<AdminOrder[]> => {
    try {
      const res = await authFetch(`${API_BASE}/orders`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders ?? [];
    } catch (error) {
      console.error('fetchAdminOrders error:', error);
      return [];
    }
  };
  
  export type AdminUser = {
    _id: string;
    email: string;
    role: 'admin' | 'seller';
    companyId: string | null;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  
  export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
    try {
      const res = await authFetch(`${API_BASE}/admin/users`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.users ?? [];
    } catch (error) {
      console.error('fetchAdminUsers error:', error);
      return [];
    }
  };
  
  export const toggleAdminUserStatus = async (userId: string): Promise<boolean> => {
    try {
      const res = await authFetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
      });
      return res.ok;
    } catch (error) {
      console.error('toggleAdminUserStatus error:', error);
      return false;
    }
  };
  // ---------- Seller API ----------

export type SellerStats = {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    lowStockVariants: number;
    revenue: number;
    ordersByStatus: Array<{ _id: string; count: number }>;
  };
  
  export const fetchSellerStats = async (): Promise<SellerStats | null> => {
    try {
      const res = await authFetch(`${API_BASE}/companies/me/stats`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.stats ?? null;
    } catch (error) {
      console.error('fetchSellerStats error:', error);
      return null;
    }
  };
  
  export type SellerOrder = {
    _id: string;
    companyId: string;
    orderNumber: string;
    buyer: { name: string; email: string; phone: string };
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    subtotal: number;
    shippingFee: number;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export const fetchSellerOrders = async (): Promise<SellerOrder[]> => {
    try {
      const res = await authFetch(`${API_BASE}/orders/my`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders ?? [];
    } catch (error) {
      console.error('fetchSellerOrders error:', error);
      return [];
    }
  };
  // ---------- Seller Products ----------

export const fetchSellerProducts = async (): Promise<Product[]> => {
    try {
      const res = await authFetch(`${API_BASE}/products/me`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.products ?? [];
    } catch (error) {
      console.error('fetchSellerProducts error:', error);
      return [];
    }
  };
  
  export const deleteSellerProduct = async (productId: string): Promise<boolean> => {
    try {
      const res = await authFetch(`${API_BASE}/products/me/${productId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      console.error('deleteSellerProduct error:', error);
      return false;
    }
  };
  // ---------- Seller Categories ----------

export const fetchSellerCategories = async (): Promise<Category[]> => {
  try {
    const res = await authFetch(`${API_BASE}/categories/me`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch (error) {
    console.error('fetchSellerCategories error:', error);
    return [];
  }
};

// ---------- Seller Product Creation ----------

export type CreateProductPayload = {
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string;
  images: string[];
  variants: Array<{
    sku: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
  }>;
};

export const createSellerProduct = async (
  payload: CreateProductPayload
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (error) {
    console.error('createSellerProduct error:', error);
    return false;
  }
};
export const fetchSellerOrderItems = async (
    orderId: string
  ): Promise<
    Array<{
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
    }>
  > => {
    try {
      const res = await authFetch(`${API_BASE}/orders/my/${orderId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.items ?? [];
    } catch (error) {
      console.error('fetchSellerOrderItems error:', error);
      return [];
    }
  };
  
  export const updateSellerOrderStatus = async (
    orderId: string,
    status: string
  ): Promise<boolean> => {
    try {
      const res = await authFetch(`${API_BASE}/orders/my/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (error) {
      console.error('updateSellerOrderStatus error:', error);
      return false;
    }
  };
  export type UpdateProductPayload = {
    name?: string;
    description?: string;
    basePrice?: number;
    categoryId?: string | null;
    images?: string[];
    isActive?: boolean;
  };
  
  export const updateSellerProduct = async (
    productId: string,
    payload: UpdateProductPayload
  ): Promise<boolean> => {
    try {
      const res = await authFetch(`${API_BASE}/products/me/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (error) {
      console.error('updateSellerProduct error:', error);
      return false;
    }
  };
  // ---------- Seller Category CRUD ----------

export const createSellerCategory = async (
  name: string
): Promise<Category | null> => {
  try {
    const res = await authFetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.category ?? null;
  } catch (error) {
    console.error('createSellerCategory error:', error);
    return null;
  }
};

export const updateSellerCategory = async (
  categoryId: string,
  name: string
): Promise<Category | null> => {
  try {
    const res = await authFetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.category ?? null;
  } catch (error) {
    console.error('updateSellerCategory error:', error);
    return null;
  }
};

export const deleteSellerCategory = async (
  categoryId: string
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('deleteSellerCategory error:', error);
    return false;
  }
};
// ---------- Seller Company Profile ----------

export type MyCompany = {
  _id: string;
  name: string;
  slug: string;
  ownerUserId: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const fetchMyCompany = async (): Promise<MyCompany | null> => {
  try {
    const res = await authFetch(`${API_BASE}/companies/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.company ?? null;
  } catch (error) {
    console.error('fetchMyCompany error:', error);
    return null;
  }
};

export type UpdateCompanyPayload = {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  logoUrl?: string;
};

export const updateMyCompany = async (
  payload: UpdateCompanyPayload
): Promise<MyCompany | null> => {
  try {
    const res = await authFetch(`${API_BASE}/companies/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.company ?? null;
  } catch (error) {
    console.error('updateMyCompany error:', error);
    return null;
  }
};