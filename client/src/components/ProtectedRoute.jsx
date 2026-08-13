import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function FullPageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-taupe" />
    </div>
  );
}

export function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && !requireRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
