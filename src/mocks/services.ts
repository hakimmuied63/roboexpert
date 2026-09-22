import type {
  Product,
  Category,
  Order,
  Review,
  Payment,
  Seller,
  User,
  AdminStats,
  SellerStats,
  OrderStatus,
} from '../types';
import {
  products as mockProducts,
  categories as mockCategories,
  orders as mockOrders,
  reviews as mockReviews,
  payments as mockPayments,
  sellers as mockSellers,
  buyers as mockBuyers,
  adminUser,
  getSellerStats as getMockSellerStats,
  getAdminStats as getMockAdminStats,
  generateId,
} from './data';

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ===== Mutable copies (simulate database) =====
let productsDb = [...mockProducts];
let ordersDb = [...mockOrders];
let reviewsDb = [...mockReviews];
let paymentsDb = [...mockPayments];
let sellersDb = [...mockSellers];

// ===== Product Services =====
export const productService = {
  async getAll(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sellerId?: string;
    featured?: boolean;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
  }): Promise<Product[]> {
    await delay();
    let filtered = [...productsDb];

    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
      );
    }
    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters?.minRating !== undefined) {
      filtered = filtered.filter(p => p.rating >= filters.minRating!);
    }
    if (filters?.sellerId) {
      filtered = filtered.filter(p => p.sellerId === filters.sellerId);
    }
    if (filters?.featured) {
      filtered = filtered.filter(p => p.featured);
    }

    // Sort
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    return filtered;
  },

  async getById(id: string): Promise<Product | undefined> {
    await delay();
    return productsDb.find(p => p.id === id);
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<Product> {
    await delay(500);
    const newProduct: Product = {
      ...product,
      id: `prod-${generateId()}`,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    productsDb.push(newProduct);
    return newProduct;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    await delay(500);
    const index = productsDb.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    productsDb[index] = { ...productsDb[index], ...updates, updatedAt: new Date().toISOString() };
    return productsDb[index];
  },

  async delete(id: string): Promise<boolean> {
    await delay(500);
    const len = productsDb.length;
    productsDb = productsDb.filter(p => p.id !== id);
    return productsDb.length < len;
  },
};

// ===== Category Services =====
export const categoryService = {
  async getAll(): Promise<Category[]> {
    await delay();
    return mockCategories;
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    await delay();
    return mockCategories.find(c => c.slug === slug);
  },
};

// ===== Order Services =====
export const orderService = {
  async getAll(filters?: { buyerId?: string; sellerId?: string; status?: OrderStatus }): Promise<Order[]> {
    await delay();
    let filtered = [...ordersDb];

    if (filters?.buyerId) {
      filtered = filtered.filter(o => o.buyerId === filters.buyerId);
    }
    if (filters?.sellerId) {
      filtered = filtered.filter(o => o.items.some(i => i.sellerId === filters.sellerId));
    }
    if (filters?.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<Order | undefined> {
    await delay();
    return ordersDb.find(o => o.id === id);
  },

  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<Order> {
    await delay(500);
    const newOrder: Order = {
      ...order,
      id: `ORD-${10000 + ordersDb.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [{ status: 'placed', timestamp: new Date().toISOString() }],
    };
    ordersDb.push(newOrder);
    return newOrder;
  },

  async updateStatus(id: string, status: OrderStatus, note?: string): Promise<Order | undefined> {
    await delay(500);
    const index = ordersDb.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    ordersDb[index] = {
      ...ordersDb[index],
      status,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...ordersDb[index].statusHistory,
        { status, timestamp: new Date().toISOString(), note },
      ],
    };
    return ordersDb[index];
  },
};

// ===== Review Services =====
export const reviewService = {
  async getByProduct(productId: string): Promise<Review[]> {
    await delay();
    return reviewsDb.filter(r => r.productId === productId);
  },

  async create(review: Omit<Review, 'id' | 'createdAt' | 'helpful'>): Promise<Review> {
    await delay(500);
    const newReview: Review = {
      ...review,
      id: `rev-${generateId()}`,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };
    reviewsDb.push(newReview);
    return newReview;
  },
};

// ===== Payment Services =====
export const paymentService = {
  async getBySeller(sellerId: string): Promise<Payment[]> {
    await delay();
    return paymentsDb.filter(p => p.sellerId === sellerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAll(): Promise<Payment[]> {
    await delay();
    return paymentsDb;
  },
};

// ===== Seller Services =====
export const sellerService = {
  async getAll(): Promise<Seller[]> {
    await delay();
    return sellersDb;
  },

  async getById(id: string): Promise<Seller | undefined> {
    await delay();
    return sellersDb.find(s => s.id === id);
  },

  async remove(id: string): Promise<boolean> {
    await delay(500);
    const len = sellersDb.length;
    sellersDb = sellersDb.filter(s => s.id !== id);
    productsDb = productsDb.filter(p => p.sellerId !== id);
    return sellersDb.length < len;
  },
};

// ===== User/Auth Services =====
export const authService = {
  async login(email: string, _password: string, role: 'buyer' | 'seller' | 'admin'): Promise<User | Seller | null> {
    await delay(500);
    if (role === 'admin') {
      return email === 'admin@roboexpert.com' ? adminUser : null;
    }
    if (role === 'seller') {
      return sellersDb.find(s => s.email === email) || null;
    }
    return mockBuyers.find(b => b.email === email) || null;
  },

  async signupBuyer(data: { name: string; email: string }): Promise<User> {
    await delay(500);
    return {
      id: `buyer-${generateId()}`,
      name: data.name,
      email: data.email,
      role: 'buyer',
      createdAt: new Date().toISOString(),
    };
  },

  async signupSeller(data: { name: string; email: string; businessName: string; payoutMethod: string }): Promise<Seller> {
    await delay(500);
    const newSeller: Seller = {
      id: `seller-${generateId()}`,
      name: data.name,
      email: data.email,
      role: 'seller',
      businessName: data.businessName,
      description: '',
      rating: 0,
      totalSales: 0,
      verified: false,
      createdAt: new Date().toISOString(),
      payoutDetails: { method: data.payoutMethod as 'razorpay' | 'bank' },
    };
    sellersDb.push(newSeller);
    return newSeller;
  },
};

// ===== Stats Services =====
export const statsService = {
  async getSellerStats(sellerId: string): Promise<SellerStats> {
    await delay();
    return getMockSellerStats(sellerId);
  },

  async getAdminStats(): Promise<AdminStats> {
    await delay();
    return getMockAdminStats();
  },
};
