import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, requireStoreOwner = false, excludeStoreOwner = false }) {
  const { currentUser, isStoreOwner, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-stone-500">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireStoreOwner && !isStoreOwner) {
    return <Navigate to="/profile" replace />;
  }

  if (excludeStoreOwner && isStoreOwner) {
    return <Navigate to="/dashboard/seller" replace />;
  }

  return children;
}
