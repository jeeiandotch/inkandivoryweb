import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { siteConfig } from "../config/site.config.js";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link to="/" className="font-script text-2xl text-ink">
          {siteConfig.siteName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {siteConfig.nav.primary.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm tracking-wide transition hover:text-taupe-dark ${
                  isActive ? "text-taupe-dark" : "text-ink/80"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${user.username}`} className="text-sm text-ink/80 hover:text-taupe-dark">
                {user.displayName}
              </Link>
              {(user.role === "OWNER" || user.role === "ADMIN") && (
                <Link to="/dashboard" className="text-sm text-taupe-dark hover:underline">
                  Dashboard
                </Link>
              )}
              <Link to="/settings" className="text-sm text-ink/80 hover:text-taupe-dark">
                Settings
              </Link>
              <button onClick={logout} className="btn-secondary !py-1.5 !px-4 text-xs">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-ink/80 hover:text-taupe-dark">
                Login
              </Link>
              <Link to="/register" className="btn-primary !py-1.5 !px-5 text-xs">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1">
            <span className="h-0.5 w-4 bg-ink" />
            <span className="h-0.5 w-4 bg-ink" />
            <span className="h-0.5 w-4 bg-ink" />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-ink/10 bg-ivory px-5 py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-3">
            {siteConfig.nav.primary.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 text-base text-ink/85"
              >
                {item.label}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-ink/10" />
            {isAuthenticated ? (
              <>
                <Link to={`/profile/${user.username}`} onClick={() => setMobileOpen(false)} className="py-1.5">
                  {user.displayName}
                </Link>
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="py-1.5">
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="btn-secondary mt-2 w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="py-1.5">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary mt-2 w-full">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
