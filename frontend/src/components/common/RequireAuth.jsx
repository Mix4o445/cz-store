import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Route wrapper that redirects unauthenticated visitors to /login while
 * preserving the originally-requested pathname so LoginPage can bounce them
 * back after a successful sign-in.
 */
export default function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search, gated: true }}
      />
    );
  }

  return children ?? <Outlet />;
}
