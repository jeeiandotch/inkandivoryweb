import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="card animate-fade-in p-8">
        <p className="mb-1 text-center font-script text-3xl text-taupe-dark">Welcome back</p>
        <h1 className="mb-6 text-center text-sm text-ink/60">Sign in to Ink & Ivory</h1>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-dusty/40 bg-rose-dusty/10 px-4 py-2 text-sm text-ink">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="emailOrUsername" className="mb-1 block text-xs font-medium text-ink/70">
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              autoComplete="username"
              required
              className="input-field"
              value={form.emailOrUsername}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink/70">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-field"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-2 disabled:opacity-60">
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          New here?{" "}
          <Link to="/register" className="text-taupe-dark underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
