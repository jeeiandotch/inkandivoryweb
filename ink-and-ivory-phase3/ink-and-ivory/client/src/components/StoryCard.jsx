import { Link } from "react-router-dom";

const STATUS_LABEL = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  HIATUS: "On Hiatus",
  COMING_SOON: "Coming Soon",
};

const STATUS_COLOR = {
  ONGOING: "bg-taupe/15 text-taupe-dark",
  COMPLETED: "bg-ink/10 text-ink/70",
  HIATUS: "bg-rose-dusty/15 text-rose-dusty",
  COMING_SOON: "bg-ink/5 text-ink/50",
};

export default function StoryCard({ story }) {
  return (
    <Link
      to={`/stories/${story.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:shadow-lift"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-parchment">
        {story.coverImageUrl ? (
          <img
            src={story.coverImageUrl}
            alt={`Cover for ${story.title}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-script text-3xl text-taupe/50">
            {story.title.slice(0, 1)}
          </div>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLOR[story.status]}`}
        >
          {STATUS_LABEL[story.status]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg leading-snug text-ink">{story.title}</h3>
        <p className="text-xs text-ink/50">by {story.author?.profile?.displayName || story.author?.username}</p>
        <p className="line-clamp-2 text-sm text-ink/60">{story.description}</p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-ink/45">
          <span>♡ {story.favoriteCount ?? 0}</span>
          <span>💬 {story.commentCount ?? 0}</span>
          <span>{story.chapterCount ?? 0} ch.</span>
        </div>
      </div>
    </Link>
  );
}
