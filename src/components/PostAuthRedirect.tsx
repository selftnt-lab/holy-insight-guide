import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * After Google OAuth (which forces redirect_uri = window.location.origin),
 * we land on `/` with the intended destination stashed in sessionStorage
 * under `post_auth_next`. Once the auth session is hydrated and we are on
 * the root, consume the stash and navigate the user there.
 */
export default function PostAuthRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;
    if (location.pathname !== "/" && location.pathname !== "/auth") return;
    let next: string | null = null;
    try {
      next = sessionStorage.getItem("post_auth_next");
    } catch {
      next = null;
    }
    if (!next) return;
    try {
      sessionStorage.removeItem("post_auth_next");
    } catch { /* ignore */ }
    if (next.startsWith("/") && !next.startsWith("//") && next !== "/") {
      navigate(next, { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return null;
}
