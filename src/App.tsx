import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/ui';
import { AdminUsers } from './pages/admin/Users';
// Layouts
import { BuyerLayout } from './layouts/BuyerLayout';
import { SellerLayout } from './layouts/SellerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { BuyerSignUp } from './pages/auth/BuyerSignUp';
import { SellerSignUp } from './pages/auth/SellerSignUp';
import { AdminLogin } from './pages/auth/AdminLogin';

// Buyer Pages
import { Home } from './pages/buyer/Home';
import { CategoryPage } from './pages/buyer/CategoryPage';
import { Search } from './pages/buyer/Search';
import { ProductDetail } from './pages/buyer/ProductDetail';
import { Cart } from './pages/buyer/Cart';
import { Checkout } from './pages/buyer/Checkout';
import { SellerProfile } from './pages/buyer/SellerProfile';
import { StorefrontPage } from './pages/buyer/StorefrontPage';

// Seller Pages
import { SellerOverview } from './pages/seller/Overview';
import { SellerProducts } from './pages/seller/Products';
import { SellerOrders } from './pages/seller/Orders';
import { SellerPayments } from './pages/seller/Payments';
import { SellerSettings } from './pages/seller/Settings';
import { SellerCategories } from './pages/seller/Categories';

// Admin Pages
import { AdminOverview } from './pages/admin/Overview';
import { AdminListings } from './pages/admin/Listings';
import { AdminSellers } from './pages/admin/Sellers';
import { AdminOrders } from './pages/admin/Orders';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home if unauthorized
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<BuyerSignUp />} />
            <Route path="/seller/signup" element={<SellerSignUp />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Buyer Routes (Storefront) */}
              <Route path="/" element={<BuyerLayout />}>
              <Route index element={<Home />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="search" element={<Search />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="seller-profile/:id" element={<SellerProfile />} />
              <Route path="shop/:companyId" element={<StorefrontPage />} />                      {/* Guest checkout — no auth required */}
               <Route path="checkout" element={<Checkout />} />
               </Route>

            {/* Seller Routes (Dashboard) */}
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <SellerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SellerOverview />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="categories" element={<SellerCategories />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="payments" element={<SellerPayments />} />
              <Route path="settings" element={<SellerSettings />} />
            </Route>

            {/* Admin Routes (Dashboard) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="sellers" element={<AdminSellers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
