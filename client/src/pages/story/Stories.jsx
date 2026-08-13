import { useEffect, useState, useCallback } from "react";
import { fetchStories, fetchGenres } from "../api/stories.js";
import StoryCard from "../components/StoryCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingGrid from "../components/LoadingGrid.jsx";
import { siteConfig } from "../config/site.config.js";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", genre: "", status: "", sort: "latest" });

  const load = useCallback(async (activeFilters) => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v));
      const results = await fetchStories(params);
      setStories(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenres().then(setGenres).catch(() => setGenres([]));
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    load(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="mb-8 text-center">
        <p className="font-script text-3xl text-taupe-dark">Stories</p>
        <p className="mt-1 text-sm text-ink/50">Every tale currently living on {siteConfig.siteName}</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <input
          type="text"
          placeholder="Search stories…"
          value={filters.q}
          onChange={(e) => handleFilterChange({ q: e.target.value })}
          className="input-field max-w-xs"
        />
        <select
          value={filters.genre}
          onChange={(e) => handleFilterChange({ genre: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.slug}>{g.name}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange({ status: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">Any status</option>
          {siteConfig.storyCategories.statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange({ sort: e.target.value })}
          className="input-field w-auto"
        >
          <option value="latest">Newest</option>
          <option value="updated">Recently updated</option>
          <option value="popular">Most read</option>
        </select>
      </div>

      {error && <p className="mb-6 text-center text-sm text-rose-dusty">{error}</p>}

      {loading ? (
        <LoadingGrid />
      ) : stories.length === 0 ? (
        <EmptyState title="No stories found" description="Try a different search or filter." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
