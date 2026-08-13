import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  displayName: "",
  username: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="card animate-fade-in p-8">
        <p className="mb-1 text-center font-script text-3xl text-taupe-dark">Join the community</p>
        <h1 className="mb-6 text-center text-sm text-ink/60">Create your Ink & Ivory account</h1>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-dusty/40 bg-rose-dusty/10 px-4 py-2 text-sm text-ink">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className="mb-1 block text-xs font-medium text-ink/70">Display Name</label>
            <input id="displayName" name="displayName" type="text" required className="input-field" value={form.displayName} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-medium text-ink/70">Username</label>
            <input id="username" name="username" type="text" required className="input-field" value={form.username} onChange={handleChange} placeholder="letters, numbers, _ and . only" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink/70">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="input-field" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink/70">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="input-field" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-ink/70">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className="input-field" value={form.confirmPassword} onChange={handleChange} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-2 disabled:opacity-60">
            {submitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="text-taupe-dark underline underline-offset-4">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
