import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { ProfilePage, WishlistPage, OrdersPage } from './pages/ProfilePages';
import { useThemeStore, useProductStore, useRouteStore } from './store';
import ProtectedRoute from './components/ui/ProtectedRoute';
import SellerDashboardPage from './pages/SellerDashboardPage';
import EditProfilePage from './pages/EditProfilePage';
// ✅ استيراد الصفحات الجديدة
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public routes */}
        <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
        <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
        <Route path="/products/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        {/* ✅ Public Info Pages */}
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />

        {/* Protected routes — must be logged in */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <PageWrapper><CartPage /></PageWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <PageWrapper><CheckoutPage /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <PageWrapper><ProfilePage /></PageWrapper>
          </ProtectedRoute>
        } />
        
        <Route path="/wishlist" element={
          <ProtectedRoute role="buyer">
            <PageWrapper><WishlistPage /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/seller/dashboard" element={
          <ProtectedRoute role="seller">
            <PageWrapper><SellerDashboardPage /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <PageWrapper><EditProfilePage /></PageWrapper>
          </ProtectedRoute>
        } />

        <Route path="/orders/my-orders" element={
          <ProtectedRoute>
            <PageWrapper><OrdersPage /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <PageWrapper>
            <div className="min-h-screen pt-20 flex items-center justify-center px-4">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="font-display text-8xl font-bold text-orange-500 mb-4 select-none"
                >
                  404
                </motion.div>
                <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                  Page not found
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  The page you are looking for does not exist.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/" className="btn-primary">Go Home</Link>
                  <Link to="/products" className="btn-secondary">Browse Products</Link>
                </div>
              </div>
            </div>
          </PageWrapper>
        } />

      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFullPage = ['/login', '/register'].includes(location.pathname);
  
  const setLastPath = useRouteStore(s => s.setLastPath);
  const lastPath = useRouteStore(s => s.lastPath);

  // ✅ حفظ الصفحة الحالية في الـ localStorage مع كل تنقل
  useEffect(() => {
    setLastPath(location.pathname);
  }, [location.pathname]);

  // ✅ استعادة الصفحة الأخيرة عند فتح الموقع أو عمل Refresh
  useEffect(() => {
    if (window.location.pathname === '/' && lastPath && lastPath !== '/') {
      navigate(lastPath, { replace: true });
    }
  }, []); 

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isFullPage && <Footer />}
      <Toaster
        position="bottom-right"
        gutter={10}
        toastOptions={{
          duration: 3000,
          className: '',
          style: {
            borderRadius: '14px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' }, duration: 4000 },
        }}
      />
    </div>
  );
}

export default function App() {
  const { initTheme }    = useThemeStore();
  const { initProducts } = useProductStore();

  useEffect(() => {
    initTheme();
    initProducts();
  }, []);

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}