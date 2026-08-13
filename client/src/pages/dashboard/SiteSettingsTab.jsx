import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSite } from "../../context/SiteContext.jsx";
import {
  fetchSiteSettingsAdmin,
  updateSiteSettingsAdmin,
  uploadSiteLogoAdmin,
  uploadSiteFaviconAdmin,
  uploadSiteBackgroundAdmin,
} from "../../api/admin.js";

export default function SiteSettingsTab() {
  const { isOwner } = useAuth();
  const { refreshSettings } = useSite();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    fetchSiteSettingsAdmin().then(setForm).catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateSiteSettingsAdmin({
        siteName: form.siteName,
        siteDescription: form.siteDescription,
        writerName: form.writerName,
        writerBio: form.writerBio,
        aboutContent: form.aboutContent,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        goldColor: form.goldColor,
        footerText: form.footerText,
        socialLinks: form.socialLinks,
        privacyPolicy: form.privacyPolicy,
        termsOfService: form.termsOfService,
      });
      setForm(updated);
      flash();
      refreshSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAssetUpload = async (kind, file) => {
    if (!file) return;
    setUploading(kind);
    setError("");
    try {
      const uploader =
        kind === "logo" ? uploadSiteLogoAdmin : kind === "favicon" ? uploadSiteFaviconAdmin : uploadSiteBackgroundAdmin;
      const updated = await uploader(file);
      setForm(updated);
      refreshSettings();
      flash();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading("");
    }
  };

  const updateSocialLink = (index, key, value) => {
    setForm((f) => {
      const links = [...(f.socialLinks || [])];
      links[index] = { ...links[index], [key]: value };
      return { ...f, socialLinks: links };
    });
  };

  const addSocialLink = () => {
    setForm((f) => ({ ...f, socialLinks: [...(f.socialLinks || []), { label: "", url: "" }] }));
  };

  const removeSocialLink = (index) => {
    setForm((f) => ({ ...f, socialLinks: (f.socialLinks || []).filter((_, i) => i !== index) }));
  };

  if (!isOwner) {
    return <p className="text-sm text-ink/50">Only the owner account can edit site settings.</p>;
  }
  if (!form) return <p className="text-sm text-ink/40">Loading…</p>;

  return (
    <div>
      <h2 className="mb-5 font-display text-lg text-ink">Customize Your Site</h2>

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-8">
        {/* ── Identity ───────────────────────────────────────── */}
        <section className="card flex flex-col gap-4 p-5">
          <h3 className="font-display text-base text-wine">Site Identity</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Site Name</label>
            <input name="siteName" value={form.siteName} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Site Description</label>
            <input name="siteDescription" value={form.siteDescription} onChange={handleChange} className="input-field" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <AssetUploader
              label="Logo"
              currentUrl={form.logoUrl}
              uploading={uploading === "logo"}
              onSelect={(file) => handleAssetUpload("logo", file)}
              shape="round"
            />
            <AssetUploader
              label="Favicon"
              currentUrl={form.faviconUrl}
              uploading={uploading === "favicon"}
              onSelect={(file) => handleAssetUpload("favicon", file)}
              shape="round"
            />
            <AssetUploader
              label="Background"
              currentUrl={form.backgroundUrl}
              uploading={uploading === "background"}
              onSelect={(file) => handleAssetUpload("background", file)}
              shape="wide"
            />
          </div>
        </section>

        {/* ── Colors ─────────────────────────────────────────── */}
        <section className="card flex flex-col gap-4 p-5">
          <h3 className="font-display text-base text-wine">Colors</h3>
          <p className="text-xs text-ink/50">
            These apply everywhere on the site — buttons, headings, links — and automatically adjust to stay
            readable when a visitor switches to dark mode.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <ColorPicker label="Primary" name="primaryColor" value={form.primaryColor} onChange={handleChange} />
            <ColorPicker label="Secondary" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} />
            <ColorPicker label="Gold Accent" name="goldColor" value={form.goldColor} onChange={handleChange} />
          </div>
        </section>

        {/* ── About page ─────────────────────────────────────── */}
        <section className="card flex flex-col gap-4 p-5">
          <h3 className="font-display text-base text-wine">About Page</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Writer Name</label>
            <input name="writerName" value={form.writerName} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Short Bio (shown under your name)</label>
            <textarea name="writerBio" value={form.writerBio} onChange={handleChange} rows={2} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">About Content (longer, shown below your bio)</label>
            <textarea name="aboutContent" value={form.aboutContent} onChange={handleChange} rows={5} className="input-field" />
          </div>
        </section>

        {/* ── Social links ───────────────────────────────────── */}
        <section className="card flex flex-col gap-4 p-5">
          <h3 className="font-display text-base text-wine">Social Links</h3>
          {(form.socialLinks || []).map((link, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Label (e.g. Instagram)"
                value={link.label || ""}
                onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                className="input-field flex-1 min-w-[140px]"
              />
              <input
                placeholder="https://..."
                value={link.url || ""}
                onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                className="input-field flex-[2] min-w-[180px]"
              />
              <button type="button" onClick={() => removeSocialLink(i)} className="btn-ghost !px-3 !py-1.5 text-xs">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addSocialLink} className="btn-secondary self-start !py-1.5 !px-4 text-xs">
            + Add Link
          </button>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <section className="card flex flex-col gap-4 p-5">
          <h3 className="font-display text-base text-wine">Footer</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Footer Text</label>
            <input name="footerText" value={form.footerText} onChange={handleChange} className="input-field" />
          </div>
        </section>

        {/* ── Legal Pages ────────────────────────────────────── */}
        <section className="card flex flex-col gap-4 p-5">
          <h3 className="font-display text-base text-wine">Legal Pages</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Privacy Policy</label>
            <textarea
              name="privacyPolicy"
              value={form.privacyPolicy || ""}
              onChange={handleChange}
              rows={8}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Terms of Service</label>
            <textarea
              name="termsOfService"
              value={form.termsOfService || ""}
              onChange={handleChange}
              rows={8}
              className="input-field"
            />
          </div>
        </section>

        {error && <p className="text-sm text-rose-dusty">{error}</p>}
        {saved && <p className="text-sm text-taupe-dark">Saved ✓</p>}

        <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      </form>
    </div>
  );
}

function ColorPicker({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/70">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" name={name} value={value} onChange={onChange} className="h-10 w-12 rounded-lg border border-taupe/20" />
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="input-field !py-1.5 text-xs"
        />
      </div>
    </div>
  );
}

function AssetUploader({ label, currentUrl, uploading, onSelect, shape }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/70">{label}</label>
      <div className="flex items-center gap-3">
        <div
          className={`overflow-hidden border border-taupe/20 bg-parchment ${
            shape === "round" ? "h-14 w-14 rounded-full" : "h-14 w-20 rounded-lg"
          }`}
        >
          {currentUrl && <img src={currentUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <label className="btn-secondary !py-1.5 !px-3 cursor-pointer text-xs">
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onSelect(e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </div>
  );
}
