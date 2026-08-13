import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchStory, toggleFavorite, toggleBookmark } from "../../api/stories.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CommentSection from "../../components/CommentSection.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const STATUS_LABEL = { ONGOING: "Ongoing", COMPLETED: "Completed", HIATUS: "On Hiatus", COMING_SOON: "Coming Soon" };

export default function StoryDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [viewerState, setViewerState] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStory(slug)
      .then(({ story, viewerState }) => {
        if (cancelled) return;
        setStory(story);
        setViewerState(viewerState);
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleFavorite = async () => {
    if (!user) return;
    const result = await toggleFavorite(story.id);
    setViewerState((s) => ({ ...s, isFavorited: result.favorited }));
    setStory((s) => ({ ...s, favoriteCount: result.favoriteCount }));
  };

  const handleBookmark = async () => {
    if (!user) return;
    const result = await toggleBookmark(story.id);
    setViewerState((s) => ({ ...s, isBookmarked: result.bookmarked }));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: story.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled share sheet — no-op */
    }
  };

  if (error) return <EmptyState title="Story not found" description={error} />;
  if (!story) return <div className="px-5 py-16 text-center text-sm text-ink/40">Loading…</div>;

  const firstChapter = story.chapters?.[0];

  return (
    <div>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="mx-auto aspect-[3/4] w-48 flex-shrink-0 overflow-hidden rounded-2xl bg-parchment shadow-soft sm:mx-0">
            {story.coverImageUrl ? (
              <img src={story.coverImageUrl} alt={`Cover for ${story.title}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-script text-4xl text-taupe/50">
                {story.title.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <span className="text-xs font-medium uppercase tracking-wide text-taupe-dark">
              {STATUS_LABEL[story.status]}
            </span>
            <h1 className="mt-1 font-display text-3xl text-ink">{story.title}</h1>
            <p className="mt-1 text-sm text-ink/50">
              by{" "}
              <Link to={`/profile/${story.author.username}`} className="text-taupe-dark hover:underline">
                {story.author.profile?.displayName || story.author.username}
              </Link>
            </p>

            <p className="mt-4 font-serif text-ink/75">{story.description}</p>

            {story.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {story.tags.map((t) => (
                  <span key={t.id} className="rounded-full bg-parchment px-3 py-1 text-xs text-ink/60">
                    #{t.name}
                  </span>
                ))}
              </div>
            )}

            {story.contentWarnings?.length > 0 && (
              <p className="mt-3 text-xs text-rose-dusty">
                Content warnings: {story.contentWarnings.join(", ")}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {firstChapter ? (
                <Link to={`/stories/${story.slug}/read/${firstChapter.order}`} className="btn-primary">
                  {viewerState?.isBookmarked ? "Continue Reading" : "Start Reading"}
                </Link>
              ) : (
                <span className="btn-secondary cursor-default opacity-60">No chapters yet</span>
              )}
              <button onClick={handleFavorite} disabled={!user} className="btn-secondary disabled:opacity-50">
                {viewerState?.isFavorited ? "♥ Favorited" : "♡ Favorite"} · {story.favoriteCount}
              </button>
              <button onClick={handleBookmark} disabled={!user} className="btn-secondary disabled:opacity-50">
                {viewerState?.isBookmarked ? "🔖 Bookmarked" : "🔖 Bookmark"}
              </button>
              <button onClick={handleShare} className="btn-ghost">
                {copied ? "Link copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>

        <div className="page-divider">
          <span>❦</span>
        </div>

        <h2 className="mb-4 font-display text-xl text-ink">Chapters</h2>
        {story.chapters?.length === 0 ? (
          <EmptyState title="No chapters published yet" description="Check back soon." />
        ) : (
          <ol className="divide-y divide-ink/5 rounded-2xl border border-ink/10">
            {story.chapters.map((ch) => (
              <li key={ch.id}>
                <Link
                  to={`/stories/${story.slug}/read/${ch.order}`}
                  className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-parchment/50"
                >
                  <span className="text-ink/80">
                    {ch.order}. {ch.title}
                    {!ch.isPublished && <span className="ml-2 text-xs text-taupe-dark">(unpublished)</span>}
                  </span>
                  <span className="text-xs text-ink/40">{ch.readingTime} min</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <CommentSection storyId={story.id} />
    </div>
  );
}
