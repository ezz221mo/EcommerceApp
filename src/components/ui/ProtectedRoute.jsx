import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';

/**
 * ProtectedRoute
 * - role="seller"    → only sellers can access
 * - role="buyer"     → only buyers can access
 * - role=null        → any authenticated user
 * - If NOT logged in → redirect /login + toast
 */
export default function ProtectedRoute({ children, role = null }) {
  const { isAuthenticated, user } = useAuthStore();
  const location  = useLocation();
  const toastFired = useRef(false);

  useEffect(() => {
    toastFired.current = false;
  }, [isAuthenticated]);

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    if (!toastFired.current) {
      toastFired.current = true;
      toast('Please login first or create a new account', {
        icon: '🔒',
        duration: 3500,
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' },
      });
    }
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ── Wrong role ─────────────────────────────────────────────────────────────
  if (role && user?.role !== role) {
    if (!toastFired.current) {
      toastFired.current = true;
      const msg = role === 'buyer'
        ? 'The wishlist is only available for buyers.'
        : `This page is for ${role}s only.`;
      toast.error(msg, {
        style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' },
      });
    }
    // Sellers go to their dashboard, buyers go home
    const fallback = user?.role === 'seller' ? '/seller/dashboard' : '/';
    return <Navigate to={fallback} replace />;
  }

  return children;
}