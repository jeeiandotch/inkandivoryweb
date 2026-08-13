import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../config/site.config.js";
import { fetchPublicSiteSettings } from "../api/publicSettings.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function About() {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchPublicSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const writerName = settings?.writerName || siteConfig.writer.name;
  const writerBio = settings?.writerBio || siteConfig.writer.bio;
  const activeSocialLinks = Object.entries(siteConfig.social).filter(([, url]) => Boolean(url));

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 text-center sm:px-8">
      <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full bg-parchment shadow-soft">
        {siteConfig.writer.avatarUrl && (
          <img src={siteConfig.writer.avatarUrl} alt={writerName} className="h-full w-full object-cover" />
        )}
      </div>
      <p className="font-script text-3xl text-taupe-dark">{writerName}</p>
      <p className="mt-1 text-sm text-ink/50">@{siteConfig.writer.username}</p>

      <p className="mx-auto mt-6 max-w-md font-serif text-lg leading-relaxed text-ink/75">{writerBio}</p>

      <div className="page-divider">
        <span>❦</span>
      </div>

      <div className="text-left">
        <h2 className="mb-3 font-display text-lg text-ink">Favorite Genres</h2>
        <div className="mb-8 flex flex-wrap gap-2">
          {siteConfig.storyCategories.genres.map((g) => (
            <span key={g} className="rounded-full bg-taupe/15 px-3 py-1 text-xs text-taupe-dark">{g}</span>
          ))}
        </div>

        {activeSocialLinks.length > 0 && (
          <>
            <h2 className="mb-3 font-display text-lg text-ink">Find Me Elsewhere</h2>
            <div className="mb-8 flex flex-wrap gap-3">
              {activeSocialLinks.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5 !px-4 text-xs capitalize">
                  {key.replace("_", ".")}
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <Link to={isAuthenticated ? `/profile/${siteConfig.writer.username}` : "/login"} className="btn-primary">
        Say Hello
      </Link>
    </div>
  );
}
