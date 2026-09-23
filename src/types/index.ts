// ===== User Types =====
export type UserRole = 'buyer' | 'seller' | 'admin';

// ===== Real Auth User (matches backend response) =====

export type AuthUserRole = 'seller' | 'admin';

export interface AuthUser {
  _id: string;
  email: string;
  role: AuthUserRole;
  companyId: string | null;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Seller extends User {
  role: 'seller';
  businessName: string;
  description: string;
  rating: number;
  totalSales: number;
  verified: boolean;
  payoutDetails: PayoutDetails;
}

export interface PayoutDetails {
  method: 'razorpay' | 'bank';
  razorpayId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
}

// ===== Product Types =====
export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== Category Types =====
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
  color: string;
  image?: string;
}

// ===== Order Types =====
export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// ===== Cart Types =====
export interface CartItem {
  product: Product;
  quantity: number;
}

// ===== Review Types =====
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  helpful: number;
}

// ===== Payment Types =====
export interface Payment {
  id: string;
  orderId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  method: string;
  paidAt?: string;
  createdAt: string;
}

// ===== Stats Types =====
export interface SellerStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  monthlySales: number[];
}

export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'listing' | 'user' | 'review';
  message: string;
  timestamp: string;
}
