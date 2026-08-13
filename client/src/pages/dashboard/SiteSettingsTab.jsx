import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchSiteSettingsAdmin, updateSiteSettingsAdmin } from "../../api/admin.js";

export default function SiteSettingsTab() {
  const { isOwner } = useAuth();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettingsAdmin().then(setForm).catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateSiteSettingsAdmin(form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner) {
    return <p className="text-sm text-ink/50">Only the owner account can edit site settings.</p>;
  }
  if (!form) return <p className="text-sm text-ink/40">Loading…</p>;

  return (
    <div>
      <h2 className="mb-5 font-display text-lg text-ink">Website Settings</h2>
      <form onSubmit={handleSubmit} className="card flex max-w-lg flex-col gap-4 p-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Site Name</label>
          <input name="siteName" value={form.siteName} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Site Description</label>
          <input name="siteDescription" value={form.siteDescription} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Writer Name</label>
          <input name="writerName" value={form.writerName} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Writer Bio</label>
          <textarea name="writerBio" value={form.writerBio} onChange={handleChange} rows={3} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Accent Color</label>
          <input name="accentColor" type="color" value={form.accentColor} onChange={handleChange} className="h-10 w-16 rounded-lg border border-ink/15" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Footer Text</label>
          <input name="footerText" value={form.footerText} onChange={handleChange} className="input-field" />
        </div>

        {error && <p className="text-sm text-rose-dusty">{error}</p>}
        {saved && <p className="text-sm text-taupe-dark">Saved ✓</p>}

        <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
