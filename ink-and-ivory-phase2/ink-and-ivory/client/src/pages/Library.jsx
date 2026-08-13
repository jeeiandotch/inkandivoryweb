import { useEffect, useState } from "react";
import { fetchLibrary } from "../api/library.js";
import StoryCard from "../components/StoryCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingGrid from "../components/LoadingGrid.jsx";

export default function Library() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("favorites");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLibrary().then(setData).catch((err) => setError(err.message));
  }, []);

  const list = data ? (tab === "favorites" ? data.favorites : data.bookmarks) : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="mb-6 text-center font-script text-3xl text-taupe-dark">My Library</p>

      <div className="mb-8 flex justify-center gap-2">
        <button
          onClick={() => setTab("favorites")}
          className={tab === "favorites" ? "btn-primary !py-1.5 !px-5 text-xs" : "btn-secondary !py-1.5 !px-5 text-xs"}
        >
          Favorites
        </button>
        <button
          onClick={() => setTab("bookmarks")}
          className={tab === "bookmarks" ? "btn-primary !py-1.5 !px-5 text-xs" : "btn-secondary !py-1.5 !px-5 text-xs"}
        >
          Bookmarks
        </button>
      </div>

      {error && <p className="mb-6 text-center text-sm text-rose-dusty">{error}</p>}

      {!data && !error ? (
        <LoadingGrid count={4} />
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "favorites" ? "No favorites yet" : "No bookmarks yet"}
          description="Stories you favorite or bookmark will show up here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
