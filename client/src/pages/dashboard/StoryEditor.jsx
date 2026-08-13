import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createStory, updateStory, uploadStoryCover, fetchGenres } from "../../api/stories.js";
import { fetchChapters, createChapter, updateChapter, deleteChapter } from "../../api/chapters.js";

const emptyStory = { title: "", description: "", genreId: "", status: "ONGOING", seriesName: "" };
const emptyChapter = { title: "", content: "", order: 1, isPublished: false };

export default function StoryEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [storyId, setStoryId] = useState(id || null);
  const [form, setForm] = useState(emptyStory);
  const [genres, setGenres] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterForm, setChapterForm] = useState(emptyChapter);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchChapters(id).then(setChapters).catch(() => {});
  }, [id]);

  // Load full story details via the admin stories list (avoids needing the
  // slug up front, since this route only has the story id).
  useEffect(() => {
    if (!id) return;
    import("../../api/admin.js").then(({ fetchStoriesAdmin }) =>
      fetchStoriesAdmin().then((all) => {
        const found = all.find((s) => s.id === id);
        if (found) {
          setForm({
            title: found.title,
            description: found.description || "",
            genreId: found.genreId || "",
            status: found.status,
            seriesName: found.seriesName || "",
          });
        }
      })
    );
  }, [id]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSaveMeta = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isNew && !storyId) {
        const story = await createStory(form);
        setStoryId(story.id);
        navigate(`/dashboard/stories/${story.id}/edit`, { replace: true });
      } else {
        await updateStory(storyId, form);
      }
      if (coverFile && storyId) {
        const updated = await uploadStoryCover(storyId, coverFile);
        setCoverUrl(updated.coverImageUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    if (!storyId) return setError("Save the story's details first.");
    setError("");
    try {
      if (editingChapterId) {
        await updateChapter(editingChapterId, chapterForm);
      } else {
        await createChapter(storyId, chapterForm);
      }
      setChapterForm({ ...emptyChapter, order: chapters.length + 1 });
      setEditingChapterId(null);
      const refreshed = await fetchChapters(storyId);
      setChapters(refreshed);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditChapter = (ch) => {
    setEditingChapterId(ch.id);
    setChapterForm({ title: ch.title, content: ch.content || "", order: ch.order, isPublished: ch.isPublished });
  };

  const handleDeleteChapter = async (ch) => {
    if (!window.confirm(`Delete chapter "${ch.title}"?`)) return;
    await deleteChapter(ch.id);
    setChapters(await fetchChapters(storyId));
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/dashboard" className="text-xs text-ink/50 hover:underline">← Back to dashboard</Link>
      <h1 className="mb-6 mt-2 font-display text-2xl text-ink">{isNew ? "New Story" : "Edit Story"}</h1>

      <form onSubmit={handleSaveMeta} className="card mb-10 flex flex-col gap-3 p-5">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="input-field" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} className="input-field" required />
        <div className="flex gap-3">
          <select name="genreId" value={form.genreId} onChange={handleChange} className="input-field">
            <option value="">No genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="HIATUS">On Hiatus</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>
        </div>
        <input name="seriesName" placeholder="Series name (optional)" value={form.seriesName} onChange={handleChange} className="input-field" />
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="text-sm" />
        </div>
        {error && <p className="text-sm text-rose-dusty">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary self-start disabled:opacity-50">
          {saving ? "Saving…" : "Save Story"}
        </button>
      </form>

      {storyId && (
        <>
          <h2 className="mb-4 font-display text-xl text-ink">Chapters</h2>
          <div className="mb-6 divide-y divide-ink/5 rounded-2xl border border-ink/10">
            {chapters.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{ch.order}. {ch.title} {!ch.isPublished && <span className="text-xs text-ink/40">(draft)</span>}</span>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => handleEditChapter(ch)} className="text-taupe-dark hover:underline">Edit</button>
                  <button onClick={() => handleDeleteChapter(ch)} className="text-rose-dusty hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChapterSubmit} className="card flex flex-col gap-3 p-5">
            <h3 className="font-display text-sm text-ink/70">{editingChapterId ? "Edit Chapter" : "New Chapter"}</h3>
            <div className="flex gap-3">
              <input
                placeholder="Chapter title"
                value={chapterForm.title}
                onChange={(e) => setChapterForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field flex-1"
                required
              />
              <input
                type="number"
                min={1}
                value={chapterForm.order}
                onChange={(e) => setChapterForm((f) => ({ ...f, order: e.target.value }))}
                className="input-field w-20"
              />
            </div>
            <textarea
              placeholder="Chapter content…"
              value={chapterForm.content}
              onChange={(e) => setChapterForm((f) => ({ ...f, content: e.target.value }))}
              rows={10}
              className="input-field font-serif"
              required
            />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={chapterForm.isPublished}
                onChange={(e) => setChapterForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              Publish this chapter
            </label>
            <button type="submit" className="btn-primary self-start">
              {editingChapterId ? "Save Chapter" : "Add Chapter"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
