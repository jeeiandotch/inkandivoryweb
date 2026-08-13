import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { globalSearch } from "../api/search.js";
import StoryCard from "../components/StoryCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async (q) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await globalSearch(q.trim());
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setParams(query ? { q: query } : {});
    runSearch(query);
  };

  const hasAnyResults =
    results && (results.stories.length || results.users.length || results.tags.length || results.genres.length);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <form onSubmit={handleSubmit} className="mx-auto mb-10 flex max-w-lg gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories, authors, tags, genres…"
          className="input-field"
          autoFocus
        />
        <button type="submit" className="btn-primary !px-5 text-sm">Search</button>
      </form>

      {loading && <p className="text-center text-sm text-ink/40">Searching…</p>}

      {!loading && results && !hasAnyResults && (
        <EmptyState title="No results found" description="Try a different search term." />
      )}

      {!loading && results && hasAnyResults && (
        <div className="flex flex-col gap-10">
          {results.stories.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg text-ink">Stories</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {results.stories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {results.users.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg text-ink">People</h2>
              <div className="flex flex-col gap-2">
                {results.users.map((u) => (
                  <Link key={u.id} to={`/profile/${u.username}`} className="card flex items-center gap-3 p-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-parchment">
                      {u.avatarUrl && <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-sm text-ink">{u.displayName || u.username}</p>
                      <p className="text-xs text-ink/40">@{u.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(results.tags.length > 0 || results.genres.length > 0) && (
            <section>
              <h2 className="mb-3 font-display text-lg text-ink">Tags & Genres</h2>
              <div className="flex flex-wrap gap-2">
                {results.genres.map((g) => (
                  <Link key={g.id} to={`/stories?genre=${g.slug}`} className="rounded-full bg-taupe/15 px-3 py-1 text-xs text-taupe-dark">
                    {g.name}
                  </Link>
                ))}
                {results.tags.map((t) => (
                  <span key={t.id} className="rounded-full bg-parchment px-3 py-1 text-xs text-ink/60">
                    #{t.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
