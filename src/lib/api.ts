const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
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
  compareAtPrice?: number;
  mrp?: number;
  rating?: number;
  reviewCount?: number;
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
  paymentMethod: 'cod' | 'online';
  items: CartItemForOrder[];
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    landingPage?: string;
    referrer?: string;
  };
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

// ---------- Razorpay Payment ----------

export type CreatePaymentOrderResponse = {
  ok: boolean;
  razorpayOrderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  orderNumber?: string;
  error?: string;
};

export const createPaymentOrder = async (
  orderId: string
): Promise<CreatePaymentOrderResponse | null> => {
  try {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('createPaymentOrder error:', data);
      return null;
    }
    return data;
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    return null;
  }
};

export const verifyPayment = async (payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ ok: boolean; message?: string; error?: string } | null> => {
  try {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('verifyPayment error:', data);
      return null;
    }
    return data;
  } catch (error) {
    console.error('verifyPayment error:', error);
    return null;
  }
};
// ---------- Chatbot ----------

export type ChatProduct = {
  _id: string;
  name: string;
  basePrice: number;
  image?: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  parts: string;
};

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<{ ok: boolean; reply?: string; products?: ChatProduct[]; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      return { ok: false, error: data?.error ?? 'Chat failed' };
    }

    return {
      ok: true,
      reply: data.reply,
      products: data.products ?? [],
    };
  } catch (error) {
    console.error('sendChatMessage error:', error);
    return { ok: false, error: 'Network error' };
  }
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
    parentId?: string | null;
  };
  subcategories: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  showAll: boolean;
  products: Product[];
};

export const fetchProductsByCompanyCategory = async (
  companyId: string,
  categorySlug: string,
  showAll: boolean = false
): Promise<CompanyCategoryProductsResponse | null> => {
  try {
    const url = showAll
      ? `${API_BASE}/catalog/companies/${companyId}/categories/${categorySlug}/products?all=true`
      : `${API_BASE}/catalog/companies/${companyId}/categories/${categorySlug}/products`;
    const res = await fetch(url);
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
  // ---------- Admin: Seller Approval ----------

export type AdminSeller = {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  companyId?: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvalNote?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  company?: {
    _id: string;
    name: string;
    slug: string;
    contactEmail: string;
    contactPhone?: string;
    gstNumber?: string;
    panCardUrl?: string;
  } | null;
};

export const fetchAdminSellers = async (
  status: 'pending' | 'approved' | 'rejected' | 'suspended' = 'pending'
): Promise<AdminSeller[]> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/sellers?status=${status}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sellers ?? [];
  } catch (error) {
    console.error('fetchAdminSellers error:', error);
    return [];
  }
};
// ---------- Admin: Leads ----------

export type Lead = {
  _id: string;
  name: string;
  phone: string;
  source?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
};

export const fetchAdminLeads = async (search?: string): Promise<Lead[]> => {
  try {
    const url = search
      ? `${API_BASE}/admin/leads?search=${encodeURIComponent(search)}`
      : `${API_BASE}/admin/leads`;
    const res = await authFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.leads ?? [];
  } catch (error) {
    console.error('fetchAdminLeads error:', error);
    return [];
  }
};

export const deleteAdminLead = async (leadId: string): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/leads/${leadId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('deleteAdminLead error:', error);
    return false;
  }
};

// ---------- Admin: Categories & Packaging ----------

export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  companyId: { _id: string; name: string; slug: string } | string;
  parentId: string | null;
  parentName: string | null;
  packagingCharge: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const fetchAdminCategories = async (
  search?: string
): Promise<AdminCategory[]> => {
  try {
    const url = search
      ? `${API_BASE}/admin/categories?search=${encodeURIComponent(search)}`
      : `${API_BASE}/admin/categories`;
    const res = await authFetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch (error) {
    console.error('fetchAdminCategories error:', error);
    return [];
  }
};

export const updateAdminCategoryPackaging = async (
  categoryId: string,
  packagingCharge: number
): Promise<boolean> => {
  try {
    const res = await authFetch(
      `${API_BASE}/admin/categories/${categoryId}/packaging`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packagingCharge }),
      }
    );
    return res.ok;
  } catch (error) {
    console.error('updateAdminCategoryPackaging error:', error);
    return false;
  }
};


export const approveAdminSeller = async (userId: string): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/sellers/${userId}/approve`, {
      method: 'POST',
    });
    return res.ok;
  } catch (error) {
    console.error('approveAdminSeller error:', error);
    return false;
  }
};

export const rejectAdminSeller = async (
  userId: string,
  reason: string
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/sellers/${userId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch (error) {
    console.error('rejectAdminSeller error:', error);
    return false;
  }
};

export const suspendAdminSeller = async (
  userId: string,
  reason: string
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/sellers/${userId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch (error) {
    console.error('suspendAdminSeller error:', error);
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
    paymentMethod: 'cod' | 'online';
    paymentStatus: string;

    // Returns
    returnStatus?: 'requested' | 'approved' | 'rejected' | 'completed' | null;
    returnReason?: string | null;
    returnNote?: string | null;
    returnRequestedAt?: string | null;
    returnResolvedAt?: string | null;

    // Refunds
    refundStatus?: 'none' | 'pending' | 'completed' | 'failed' | null;
    refundId?: string | null;
    refundAmount?: number | null;
    refundedAt?: string | null;
    refundFailureReason?: string | null;

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

  export type CategoryTreeNode = Category & {
    productCount?: number;
    children: CategoryTreeNode[];
  };
  
  export const fetchSellerCategories = async (): Promise<CategoryTreeNode[]> => {
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
  export const updateSellerReturnStatus = async (
    orderId: string,
    action: 'approve' | 'reject' | 'received',
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await authFetch(`${API_BASE}/orders/my/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...(note ? { note } : {}) }),
      });
      return res.ok;
    } catch (error) {
      console.error('updateSellerReturnStatus error:', error);
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
    name: string,
    parentId?: string | null
  ): Promise<Category | null> => {
    try {
      const res = await authFetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: parentId ?? null }),
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
// ---------- Seller Payment Config ----------

export type SellerPaymentConfig = {
  _id: string;
  companyId: string;
  razorpayKeyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaymentConfigStatus = {
  configured: boolean;
  config: SellerPaymentConfig | null;
};

export const fetchMyPaymentConfig = async (): Promise<PaymentConfigStatus> => {
  try {
    const res = await authFetch(`${API_BASE}/payment-config/me`);
    if (!res.ok) return { configured: false, config: null };
    return res.json();
  } catch (error) {
    console.error('fetchMyPaymentConfig error:', error);
    return { configured: false, config: null };
  }
};

export const savePaymentConfig = async (
  razorpayKeyId: string,
  razorpayKeySecret: string
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/payment-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpayKeyId, razorpayKeySecret }),
    });
    return res.ok;
  } catch (error) {
    console.error('savePaymentConfig error:', error);
    return false;
  }
};

export const deletePaymentConfig = async (): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/payment-config/me`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('deletePaymentConfig error:', error);
    return false;
  }
};
// ---------- Seller Signup ----------

export type SignupSellerPayload = {
  email: string;
  password: string;
  name: string;
  businessName: string;
  phone: string;
  gstNumber: string;
  panCardUrl: string;
};
export type SignupSellerResult =
  | {
      success: true;
      user: {
        _id: string;
        email: string;
        role: 'seller' | 'admin';
        companyId: string | null;
        name: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
      accessToken: string;
      refreshToken: string;
    }
  | { success: false; error: string };

export const signupSeller = async (
  payload: SignupSellerPayload
): Promise<SignupSellerResult> => {
  try {
    // Step 1: create user
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        role: 'seller',
      }),
    });

    const signupData = await signupRes.json().catch(() => null);

    if (!signupRes.ok || !signupData || !signupData.ok) {
      return {
        success: false,
        error: signupData?.error ?? 'Signup failed',
      };
    }

    const { accessToken } = signupData;

    // Step 2: create company for this user
    const companyRes = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: payload.businessName,
        contactEmail: payload.email,
        contactPhone: payload.phone,
        gstNumber: payload.gstNumber,
        panCardUrl: payload.panCardUrl,
      }),
    });

    const companyData = await companyRes.json().catch(() => null);

    if (!companyRes.ok || !companyData || !companyData.ok) {
      return {
        success: false,
        error:
          companyData?.error ??
          'Account created but company setup failed. Please contact support.',
      };
    }

       // Company is created. Log in again to get a fresh token with companyId baked in.
       const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      });
  
      const loginData = await loginRes.json().catch(() => null);
  
      if (!loginRes.ok || !loginData || !loginData.ok) {
        return {
          success: false,
          error: 'Company created, but login failed. Please log in manually.',
        };
      }
  
      return {
        success: true,
        user: loginData.user,
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
      };
    } catch (error) {
      console.error('signupSeller error:', error);
      return { success: false, error: 'Network error — please try again' };
    }
  };
  // ---------- Marketplace Categories ----------

export const fetchMarketplaceCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? [];
  } catch (error) {
    console.error('fetchMarketplaceCategories error:', error);
    return [];
  }
};
// ---------- Bulk Product Upload ----------

export type BulkUploadRow = {
  name: string;
  description?: string;
  basePrice: number;
  category?: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  imageUrl?: string;
};

export type BulkUploadSummary = {
  rowsReceived: number;
  rowsValid: number;
  rowsFailed: number;
  productsCreated: number;
  variantsCreated: number;
};

export type BulkUploadResponse =
  | {
      success: true;
      summary: BulkUploadSummary;
      products: Array<{ _id: string; name: string; variantCount: number }>;
      errors: Array<{ row: number; error: string }>;
    }
  | { success: false; error: string };

export const bulkCreateProducts = async (
  rows: BulkUploadRow[]
): Promise<BulkUploadResponse> => {
  try {
    const res = await authFetch(`${API_BASE}/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      return {
        success: false,
        error: data?.error ?? 'Bulk upload failed',
      };
    }

    return {
      success: true,
      summary: data.summary,
      products: data.products,
      errors: data.errors,
    };
  } catch (error) {
    console.error('bulkCreateProducts error:', error);
    return { success: false, error: 'Network error — please try again' };
  }
};
// ---------- Order Tracking / Cancel / Return ----------

export type TrackedOrder = {
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
  packagingFee: number;
  total: number;
  status: string;
  paymentMethod: 'cod' | 'online';
  paymentStatus: string;
  notes?: string;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  cancellationNote?: string | null;
  returnStatus?: 'requested' | 'approved' | 'rejected' | 'completed' | null;
  returnReason?: string | null;
  returnNote?: string | null;
  returnRequestedAt?: string | null;
  returnResolvedAt?: string | null;
  refundStatus?: 'none' | 'pending' | 'completed' | 'failed' | null;
  refundId?: string | null;
  refundAmount?: number | null;
  refundedAt?: string | null;
  refundFailureReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrackedOrderItem = {
  _id: string;
  orderId: string;
  companyId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productSnapshot: {
    name: string;
    image?: string;
    variantAttributes: Record<string, string>;
    sku: string;
  };
  createdAt: string;
};

export type TrackOrderResponse = {
  ok: boolean;
  order: TrackedOrder;
  items: TrackedOrderItem[];
};

export const trackOrder = async (
  orderNumber: string,
  email: string
): Promise<{ success: true; data: TrackOrderResponse } | { success: false; error: string }> => {
  try {
    const res = await fetch(
      `${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`
    );
    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      return { success: false, error: data?.error ?? 'Order not found' };
    }
    return { success: true, data };
  } catch (error) {
    console.error('trackOrder error:', error);
    return { success: false, error: 'Network error' };
  }
};

export const cancelOrder = async (
  orderNumber: string,
  email: string,
  reason: string,
  note?: string
): Promise<{ success: true; data: TrackOrderResponse } | { success: false; error: string }> => {
  try {
    const res = await fetch(
      `${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}/cancel`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason, note }),
      }
    );
    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      return { success: false, error: data?.error ?? 'Could not cancel order' };
    }
    return { success: true, data: { ok: true, order: data.order, items: [] } };
  } catch (error) {
    console.error('cancelOrder error:', error);
    return { success: false, error: 'Network error' };
  }
};

export const requestReturn = async (
  orderNumber: string,
  email: string,
  reason: string,
  note?: string
): Promise<{ success: true; data: TrackOrderResponse } | { success: false; error: string }> => {
  try {
    const res = await fetch(
      `${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}/return`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason, note }),
      }
    );
    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      return { success: false, error: data?.error ?? 'Could not request return' };
    }
    return { success: true, data: { ok: true, order: data.order, items: [] } };
  } catch (error) {
    console.error('requestReturn error:', error);
    return { success: false, error: 'Network error' };
  }
};
// ---------- Invoice Download ----------

export const getInvoiceUrl = (orderNumber: string, email: string): string => {
  return `${API_BASE}/orders/track/${encodeURIComponent(
    orderNumber
  )}/invoice?email=${encodeURIComponent(email)}`;
};

export const getSellerInvoiceUrl = (orderId: string): string => {
  // Seller uses auth header, so we need to fetch with auth
  // For downloads, we'll use the fetch-with-blob approach
  return `${API_BASE}/orders/my/${orderId}/invoice`;
};

export const downloadSellerInvoice = async (orderId: string): Promise<boolean> => {
  try {
    const res = await authFetch(getSellerInvoiceUrl(orderId));
    if (!res.ok) return false;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('downloadSellerInvoice error:', error);
    return false;
  }
};
// ---------- File Upload ----------

export const uploadImage = async (
  file: File,
  folder: 'products' | 'sellers' | 'profiles' | 'leads' = 'products'
): Promise<{ ok: boolean; url?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await authFetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || !data.ok) {
      return { ok: false, error: data?.error ?? 'Upload failed' };
    }

    return { ok: true, url: data.url };
  } catch (error) {
    console.error('uploadImage error:', error);
    return { ok: false, error: 'Network error' };
  }
};
// ---------- Lead Capture ----------

export const createLead = async (
  name: string,
  phone: string,
  source = 'popup'
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, source }),
    });
    return res.ok;
  } catch (error) {
    console.error('createLead error:', error);
    return false;
  }
};
// ---------- OTP ----------

export type SendOtpResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type VerifyOtpResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export const sendOtp = async (
  email: string,
  purpose: 'checkout' | 'signup' | 'password_reset' = 'checkout',
): Promise<SendOtpResult> => {
  try {
    const res = await fetch(`${API_BASE}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });
    return await res.json();
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
};

export const verifyOtp = async (
  email: string,
  code: string,
  purpose: 'checkout' | 'signup' | 'password_reset' = 'checkout',
): Promise<VerifyOtpResult> => {
  try {
    const res = await fetch(`${API_BASE}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, purpose }),
    });
    return await res.json();
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
};

// ---------- Reviews ----------

export type Review = {
  _id: string;
  productId: string;
  companyId: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  rating: number;
  comment?: string | null;
  images: string[];
  reported: boolean;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListReviewsResponse = {
  ok: boolean;
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export const fetchProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ListReviewsResponse> => {
  try {
    const res = await fetch(
      `${API_BASE}/products/${productId}/reviews?page=${page}&limit=${limit}`
    );
    if (!res.ok) {
      return {
        ok: false,
        reviews: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }
    return await res.json();
  } catch (error) {
    console.error('fetchProductReviews error:', error);
    return {
      ok: false,
      reviews: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }
};

export const createProductReview = async (
  productId: string,
  payload: { 
    orderNumber: string; 
    email: string; 
    rating: number; 
    comment?: string; 
    images?: string[] 
  }
): Promise<{ ok: boolean; review?: Review; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || 'Could not submit review' };
    }
    return { ok: true, review: data.review };
  } catch (error) {
    console.error('createProductReview error:', error);
    return { ok: false, error: 'Could not submit review' };
  }
};

export const reportProductReview = async (
  reviewId: string,
  reason: string
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch (error) {
    console.error('reportProductReview error:', error);
    return false;
  }
};

export const uploadReviewImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authFetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? data.imageUrl ?? null;
  } catch (error) {
    console.error('uploadReviewImage error:', error);
    return null;
  }
};
// ---------- Reported Reviews ----------

export type ReportedReview = {
  _id: string;
  productId: { _id: string; name: string; images: string[] };
  buyerName: string;
  rating: number;
  comment: string | null;
  images: string[];
  reportedBy?: { name: string; email: string; role: string };
  reportedByRole?: string;
  reportReason: string;
  reportedAt: string;
  createdAt: string;
};

export const fetchReportedReviews = async (): Promise<ReportedReview[]> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/reviews/reported`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews ?? [];
  } catch (error) {
    console.error('fetchReportedReviews error:', error);
    return [];
  }
};

export const handleReportedReviewAction = async (
  reviewId: string,
  action: 'hide' | 'dismiss'
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/admin/reviews/${reviewId}/action`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    return res.ok;
  } catch (error) {
    console.error('handleReportedReviewAction error:', error);
    return false;
  }
};

export const reportSellerReview = async (
  reviewId: string,
  reason: string
): Promise<boolean> => {
  try {
    const res = await authFetch(`${API_BASE}/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.ok;
  } catch (error) {
    console.error('reportSellerReview error:', error);
    return false;
  }
};
// ---------- Seller Reviews ----------

export type SellerReview = {
  _id: string;
  productId: { _id: string; name: string; images: string[] };
  buyerName: string;
  rating: number;
  comment: string | null;
  images: string[];
  createdAt: string;
  reported: boolean;
};

export const fetchSellerReviews = async (): Promise<SellerReview[]> => {
  try {
    const res = await authFetch(`${API_BASE}/seller/reviews`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews ?? [];
  } catch (error) {
    console.error('fetchSellerReviews error:', error);
    return [];
  }
};