import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import { useThemeStore, useProductStore } from './store';
import ProtectedRoute from './components/ui/ProtectedRoute';
import ScrollToTop from './components/ui/ScrollToTop';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePages').then(m => ({ default: m.ProfilePage })));
const WishlistPage = lazy(() => import('./pages/ProfilePages').then(m => ({ default: m.WishlistPage })));
const OrdersPage = lazy(() => import('./pages/ProfilePages').then(m => ({ default: m.OrdersPage })));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const SellerDashboardPage = lazy(() => import('./pages/SellerDashboardPage'));
const DeliveryDashboardPage = lazy(() => import('./pages/DeliveryDashboardPage'));
const OutfitPage = lazy(() => import('./pages/OutfitPage'));
const CreateSetPage = lazy(() => import('./pages/CreateSetPage'));
const SetDetailPage = lazy(() => import('./pages/SetDetailPage'));
const ComplaintsPage = lazy(() => import('./pages/ComplaintsPage'));

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.08 } },
};

const PageWrapper = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
          <Route path="/products/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

          <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
          <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
          <Route path="/terms-and-conditions" element={<PageWrapper><TermsPage /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
          <Route path="/privacy-policy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
          <Route path="/customer-support" element={<PageWrapper><ComplaintsPage /></PageWrapper>} />

          <Route path="/outfit" element={<PageWrapper><OutfitPage /></PageWrapper>} />
          
          <Route path="/create-set" element={<ProtectedRoute excludeStoreOwner={true}><PageWrapper><CreateSetPage /></PageWrapper></ProtectedRoute>} />
          <Route path="/create-set/:setId" element={<ProtectedRoute excludeStoreOwner={true}><PageWrapper><SetDetailPage /></PageWrapper></ProtectedRoute>} />

          <Route path="/cart" element={
            <ProtectedRoute excludeStoreOwner={true}><PageWrapper><CartPage /></PageWrapper></ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute excludeStoreOwner={true}><PageWrapper><CheckoutPage /></PageWrapper></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute excludeStoreOwner={true}><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>
          } />
          
          <Route path="/wishlist" element={
            <ProtectedRoute excludeStoreOwner={true}><PageWrapper><WishlistPage /></PageWrapper></ProtectedRoute>
          } />

          <Route path="/dashboard/seller" element={
            <ProtectedRoute requireStoreOwner={true}><PageWrapper><SellerDashboardPage /></PageWrapper></ProtectedRoute>
          } />

          <Route path="/dashboard/delivery" element={
            <ProtectedRoute requireDelivery={true}><PageWrapper><DeliveryDashboardPage /></PageWrapper></ProtectedRoute>
          } />

          <Route path="/profile/edit" element={
            <ProtectedRoute excludeStoreOwner={true}><PageWrapper><EditProfilePage /></PageWrapper></ProtectedRoute>
          } />

          <Route path="/orders/my-orders" element={
            <ProtectedRoute excludeStoreOwner={true}><PageWrapper><OrdersPage /></PageWrapper></ProtectedRoute>
          } />

          <Route path="*" element={
            <PageWrapper>
              <div className="min-h-screen pt-20 flex items-center justify-center px-4">
                <div className="text-center">
                  <div className="font-display text-8xl font-bold text-orange-500 mb-4 select-none">
                    404
                  </div>
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
    </Suspense>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDelivery, loading } = useAuth();
  const isFullPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    if (!loading && isDelivery && location.pathname !== '/dashboard/delivery') {
      navigate('/dashboard/delivery', { replace: true });
    }
  }, [isDelivery, loading, location.pathname, navigate]);

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
  const { initTheme }     = useThemeStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    initTheme();
    fetchProducts();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
