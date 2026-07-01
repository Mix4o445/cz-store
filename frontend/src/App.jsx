import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BrandsPage from './pages/BrandsPage';
import NotFoundPage from './pages/NotFoundPage';
import MaintenancePage from './pages/MaintenancePage';

import AccountLayout from './pages/account/AccountLayout';
import AccountOverview from './pages/account/AccountOverview';
import AccountProfile from './pages/account/AccountProfile';
import AccountAddresses from './pages/account/AccountAddresses';
import AccountOrders from './pages/account/AccountOrders';
import AccountSecurity from './pages/account/AccountSecurity';
import AccountPreferences from './pages/account/AccountPreferences';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAssistant from './pages/admin/AdminAssistant';
import AdminSettings from './pages/admin/AdminSettings';

import RequireAuth from './components/common/RequireAuth';
import OrderConfirmPage from './pages/OrderConfirmPage';
import { useMaintenance } from './hooks/useSettings';
import { useAuthStore } from './store/authStore';
import SEO from './components/common/SEO';

export default function App() {
  const location = useLocation();
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const { data: settings } = useMaintenance();

  // When maintenance is on, hide the storefront from non-admins. Admins
  // keep full access at /admin/* so they can disable the flag.
  const inAdmin = location.pathname.startsWith('/admin');
  const showMaintenance =
    !!settings?.maintenanceMode && !isAdmin && !inAdmin;

  // Inject a noindex meta while the storefront is gated, so search
  // engines never index the maintenance page.
  useEffect(() => {
    if (showMaintenance) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      meta.dataset.maintenance = 'true';
      document.head.appendChild(meta);
    } else {
      document.querySelector('meta[data-maintenance="true"]')?.remove();
    }
    return () => {
      document.querySelector('meta[data-maintenance="true"]')?.remove();
    };
  }, [showMaintenance]);

  if (showMaintenance) {
    return (
      <>
        <SEO title="Maintenance en cours" path="/maintenance" noindex />
        <MaintenancePage />
      </>
    );
  }

  return (
    <Routes>
      {/* Admin section — mounted at the top level (outside the storefront
          Layout) so it renders with its own chrome and is never subject
          to the maintenance-mode storefront gate. */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="assistant" element={<AdminAssistant />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Storefront — the public Layout is a layout route. Its <Outlet/>
          renders whichever child route matched. Every other URL falls
          through to the catch-all 404. */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="brands" element={<BrandsPage />} />

        <Route element={<RequireAuth />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="orders/:id" element={<OrderConfirmPage />} />
        </Route>

        <Route path="account" element={<AccountLayout />}>
          <Route index element={<AccountOverview />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="security" element={<AccountSecurity />} />
          <Route path="preferences" element={<AccountPreferences />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
