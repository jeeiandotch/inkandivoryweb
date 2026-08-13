import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchMySettings,
  updateMyAccount,
  updateMyProfile,
  uploadMyAvatar,
  updateMyPreferences,
  updateMyPrivacy,
  deleteMyAccount,
} from "../api/mySettings.js";

const SECTIONS = ["Account", "Profile", "Preferences", "Privacy", "Danger Zone"];

export default function Settings() {
  const { setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("Account");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchMySettings().then(setData).catch((err) => setStatus({ type: "error", message: err.message }));
  }, []);

  const flash = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  if (!data) return <div className="px-5 py-16 text-center text-sm text-ink/40">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <p className="mb-8 font-script text-3xl text-taupe-dark">Settings</p>

      <div className="flex flex-col gap-8 sm:flex-row">
        <nav className="flex gap-2 sm:w-40 sm:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`rounded-full px-4 py-2 text-left text-sm sm:rounded-xl ${
                section === s ? "bg-ink text-ivory" : "text-ink/60 hover:bg-ink/5"
              } ${s === "Danger Zone" && section !== s ? "text-rose-dusty/70" : ""}`}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {status.message && (
            <p className={`mb-4 text-sm ${status.type === "error" ? "text-rose-dusty" : "text-taupe-dark"}`}>
              {status.message}
            </p>
          )}

          {section === "Account" && (
            <AccountSection account={data.account} onSaved={(a) => { setData((d) => ({ ...d, account: a })); flash("ok", "Account updated."); }} onError={(m) => flash("error", m)} />
          )}
          {section === "Profile" && (
            <ProfileSection
              profile={data.profile}
              onSaved={(p) => {
                setData((d) => ({ ...d, profile: p }));
                setUser((u) => ({ ...u, displayName: p.displayName, avatarUrl: p.avatarUrl, bio: p.bio }));
                flash("ok", "Profile updated.");
              }}
              onError={(m) => flash("error", m)}
            />
          )}
          {section === "Preferences" && (
            <PreferencesSection preferences={data.preferences} onSaved={(p) => { setData((d) => ({ ...d, preferences: p })); flash("ok", "Preferences saved."); }} onError={(m) => flash("error", m)} />
          )}
          {section === "Privacy" && (
            <PrivacySection privacy={data.privacy} onSaved={(p) => { setData((d) => ({ ...d, privacy: p })); flash("ok", "Privacy settings saved."); }} onError={(m) => flash("error", m)} />
          )}
          {section === "Danger Zone" && (
            <DangerZoneSection
              onDeleted={async () => {
                await logout();
                navigate("/", { replace: true });
              }}
              onError={(m) => flash("error", m)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AccountSection({ account, onSaved, onError }) {
  const [form, setForm] = useState({ email: account.email, username: account.username, currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyAccount(form);
      onSaved(updated);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card flex max-w-md flex-col gap-3 p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Email</label>
        <input className="input-field" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Username</label>
        <input className="input-field" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">New Password (optional)</label>
        <input type="password" className="input-field" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Current Password (required to save)</label>
        <input type="password" required className="input-field" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
        {saving ? "Saving…" : "Save Account"}
      </button>
    </form>
  );
}

function ProfileSection({ profile, onSaved, onError }) {
  const [form, setForm] = useState({ displayName: profile.displayName || "", bio: profile.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updated = await updateMyProfile(form);
      if (avatarFile) updated = await uploadMyAvatar(avatarFile);
      onSaved(updated);
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card flex max-w-md flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-parchment">
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Display Name</label>
        <input className="input-field" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Bio</label>
        <textarea rows={3} className="input-field" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
        {saving ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}

function PreferencesSection({ preferences, onSaved, onError }) {
  const [form, setForm] = useState(preferences);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyPreferences(form);
      onSaved(updated);
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card flex max-w-md flex-col gap-4 p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Reading Mode</label>
        <select className="input-field" value={form.readingMode} onChange={(e) => setForm((f) => ({ ...f, readingMode: e.target.value }))}>
          <option value="light">Light</option>
          <option value="sepia">Sepia</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Reading Width</label>
        <select className="input-field" value={form.readingWidth} onChange={(e) => setForm((f) => ({ ...f, readingWidth: e.target.value }))}>
          <option value="narrow">Narrow</option>
          <option value="comfortable">Comfortable</option>
          <option value="wide">Wide</option>
        </select>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium text-ink/70">Notifications</legend>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.notifyOnComment} onChange={(e) => setForm((f) => ({ ...f, notifyOnComment: e.target.checked }))} />
          Comment replies
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.notifyOnMessage} onChange={(e) => setForm((f) => ({ ...f, notifyOnMessage: e.target.checked }))} />
          New messages
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.notifyOnAnnouncement} onChange={(e) => setForm((f) => ({ ...f, notifyOnAnnouncement: e.target.checked }))} />
          Announcements
        </label>
      </fieldset>
      <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
        {saving ? "Saving…" : "Save Preferences"}
      </button>
    </form>
  );
}

function PrivacySection({ privacy, onSaved, onError }) {
  const [form, setForm] = useState(privacy);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMyPrivacy(form);
      onSaved(updated);
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card flex max-w-md flex-col gap-4 p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Profile Visibility</label>
        <select className="input-field" value={form.profileVisibility} onChange={(e) => setForm((f) => ({ ...f, profileVisibility: e.target.value }))}>
          <option value="PUBLIC">Public</option>
          <option value="MEMBERS_ONLY">Members only</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/70">Who can message you</label>
        <select className="input-field" value={form.messagingPreference} onChange={(e) => setForm((f) => ({ ...f, messagingPreference: e.target.value }))}>
          <option value="EVERYONE">Everyone</option>
          <option value="NO_ONE">No one</option>
        </select>
      </div>
      <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
        {saving ? "Saving…" : "Save Privacy"}
      </button>
    </form>
  );
}

function DangerZoneSection({ onDeleted, onError }) {
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setDeleting(true);
    try {
      await deleteMyAccount(password);
      onDeleted();
    } catch (err) {
      onError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card max-w-md border-rose-dusty/30 p-5">
      <h3 className="mb-2 font-display text-sm text-rose-dusty">Delete Account</h3>
      <p className="mb-4 text-sm text-ink/60">
        This permanently deletes your account, comments, and messages. This cannot be undone.
      </p>
      {!confirming ? (
        <button onClick={() => setConfirming(true)} className="btn-secondary !border-rose-dusty/40 !text-rose-dusty">
          Delete my account
        </button>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            placeholder="Confirm your password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={deleting} className="btn-primary !bg-rose-dusty disabled:opacity-50">
              {deleting ? "Deleting…" : "Permanently delete"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
