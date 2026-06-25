import { Routes, Route } from 'react-router-dom';
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
import NotFoundPage from './pages/NotFoundPage';

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

import RequireAuth from './components/common/RequireAuth';
import OrderConfirmPage from './pages/OrderConfirmPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />

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

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
