import { useEffect, useState } from "react";
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../api/announcements.js";

const emptyForm = { title: "", content: "", isPinned: false };

export default function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => fetchAnnouncements().then(setAnnouncements).catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
      } else {
        await createAnnouncement(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.id);
    setForm({ title: a.title, content: a.content, isPinned: a.isPinned });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id);
    load();
  };

  const handlePinToggle = async (a) => {
    await updateAnnouncement(a.id, { isPinned: !a.isPinned });
    load();
  };

  return (
    <div>
      <h2 className="mb-5 font-display text-lg text-ink">
        {editingId ? "Edit Announcement" : "New Announcement"}
      </h2>

      <form onSubmit={handleSubmit} className="card mb-8 flex flex-col gap-3 p-5">
        <input
          className="input-field"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <textarea
          className="input-field"
          rows={4}
          placeholder="What's on your mind?"
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.isPinned}
            onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
          />
          Pin to top
        </label>
        {error && <p className="text-sm text-rose-dusty">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={submitting} className="btn-primary !py-2 !px-5 text-xs disabled:opacity-50">
            {editingId ? "Save Changes" : "Post Announcement"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="btn-secondary !py-2 !px-5 text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {!announcements ? (
        <p className="text-sm text-ink/40">Loading…</p>
      ) : (
        <div className="divide-y divide-ink/5 rounded-2xl border border-ink/10">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  {a.isPinned && "📌 "}
                  {a.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink/50">{a.content}</p>
              </div>
              <div className="flex flex-shrink-0 gap-3 text-xs">
                <button onClick={() => handlePinToggle(a)} className="text-taupe-dark hover:underline">
                  {a.isPinned ? "Unpin" : "Pin"}
                </button>
                <button onClick={() => handleEdit(a)} className="text-taupe-dark hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(a.id)} className="text-rose-dusty hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
