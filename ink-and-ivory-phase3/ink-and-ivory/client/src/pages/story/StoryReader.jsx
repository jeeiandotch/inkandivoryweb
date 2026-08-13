import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchStory } from "../../api/stories.js";
import { fetchChapter } from "../../api/chapters.js";
import { toggleBookmark } from "../../api/stories.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const MODES = {
  light: "bg-ivory text-ink",
  sepia: "bg-[#f1e7d0] text-[#3a2f22]",
  dark: "bg-[#1c1a17] text-[#e8e0d3]",
};

const WIDTHS = { narrow: "max-w-xl", comfortable: "max-w-2xl", wide: "max-w-3xl" };

export default function StoryReader() {
  const { slug, order } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [nav, setNav] = useState({ prev: null, next: null });
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("ii-font-size")) || 18);
  const [mode, setMode] = useState(() => localStorage.getItem("ii-reading-mode") || "light");
  const [width, setWidth] = useState(() => localStorage.getItem("ii-reading-width") || "comfortable");
  const [showControls, setShowControls] = useState(true);

  const contentRef = useRef(null);

  useEffect(() => localStorage.setItem("ii-font-size", String(fontSize)), [fontSize]);
  useEffect(() => localStorage.setItem("ii-reading-mode", mode), [mode]);
  useEffect(() => localStorage.setItem("ii-reading-width", width), [width]);

  useEffect(() => {
    let cancelled = false;
    setError("");

    (async () => {
      try {
        const { story: storyMeta } = await fetchStory(slug);
        if (cancelled) return;
        setStory(storyMeta);
        const { chapter, prev, next } = await fetchChapter(storyMeta.id, order);
        if (cancelled) return;
        setChapter(chapter);
        setNav({ prev, next });
        window.scrollTo({ top: 0 });
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, order]);

  const handleScroll = useCallback(() => {
    const doc = document.documentElement;
    const scrolled = (doc.scrollTop) / (doc.scrollHeight - doc.clientHeight || 1);
    setProgress(Math.min(1, Math.max(0, scrolled)));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleBookmarkHere = async () => {
    if (!user || !story || !chapter) return;
    await toggleBookmark(story.id, chapter.id);
  };

  const goToChapter = (targetOrder) => {
    navigate(`/stories/${slug}/read/${targetOrder}`);
  };

  if (error) return <EmptyState title="Chapter not found" description={error} />;
  if (!story || !chapter) return <div className="px-5 py-16 text-center text-sm text-ink/40">Loading…</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${MODES[mode]}`}>
      {/* Progress bar */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-black/5">
        <div
          className="h-full bg-taupe transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Controls bar */}
      <div className="sticky top-0 z-40 border-b border-current/10 bg-inherit/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-2.5">
          <Link to={`/stories/${slug}`} className="text-xs opacity-60 hover:opacity-100">
            ← {story.title}
          </Link>
          <button onClick={() => setShowControls((v) => !v)} className="text-xs opacity-60 hover:opacity-100">
            {showControls ? "Hide controls" : "Show controls"}
          </button>
        </div>

        {showControls && (
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-5 pb-3 text-xs opacity-80">
            <div className="flex items-center gap-1.5">
              <span>Aa</span>
              <button onClick={() => setFontSize((s) => Math.max(14, s - 2))} className="rounded border border-current/20 px-2 py-0.5">-</button>
              <span>{fontSize}px</span>
              <button onClick={() => setFontSize((s) => Math.min(28, s + 2))} className="rounded border border-current/20 px-2 py-0.5">+</button>
            </div>
            <div className="flex items-center gap-1.5">
              {Object.keys(MODES).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full px-2.5 py-0.5 border ${mode === m ? "border-current" : "border-current/20 opacity-60"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {Object.keys(WIDTHS).map((w) => (
                <button
                  key={w}
                  onClick={() => setWidth(w)}
                  className={`rounded-full px-2.5 py-0.5 border ${width === w ? "border-current" : "border-current/20 opacity-60"}`}
                >
                  {w}
                </button>
              ))}
            </div>
            {user && (
              <button onClick={handleBookmarkHere} className="ml-auto rounded-full border border-current/20 px-2.5 py-0.5">
                🔖 Bookmark here
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <article ref={contentRef} className={`mx-auto ${WIDTHS[width]} px-6 py-12`}>
        <p className="mb-2 text-center text-xs uppercase tracking-widest opacity-50">
          Chapter {chapter.order}
        </p>
        <h1 className="mb-8 text-center font-display text-2xl">{chapter.title}</h1>
        <div
          className="prose-reader whitespace-pre-wrap font-serif leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {chapter.content}
        </div>
      </article>

      {/* Chapter nav */}
      <div className={`mx-auto ${WIDTHS[width]} flex items-center justify-between px-6 pb-16 pt-4 text-sm`}>
        {nav.prev ? (
          <button onClick={() => goToChapter(nav.prev.order)} className="opacity-70 hover:opacity-100">
            ← Ch. {nav.prev.order}: {nav.prev.title}
          </button>
        ) : (
          <span />
        )}
        {nav.next ? (
          <button onClick={() => goToChapter(nav.next.order)} className="opacity-70 hover:opacity-100">
            Ch. {nav.next.order}: {nav.next.title} →
          </button>
        ) : (
          <Link to={`/stories/${slug}`} className="opacity-70 hover:opacity-100">
            Back to story ✓
          </Link>
        )}
      </div>
    </div>
  );
}
