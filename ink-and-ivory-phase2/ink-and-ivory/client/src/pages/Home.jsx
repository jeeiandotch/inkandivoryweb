import { Link } from "react-router-dom";
import { siteConfig } from "../config/site.config.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
        <p className="mb-4 text-taupe-dark">✒️ {siteConfig.tagline}</p>
        <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">{siteConfig.homepage.heroTitle}</h1>
        <p className="mx-auto mt-5 max-w-md font-serif text-lg italic text-ink/70">
          {siteConfig.homepage.heroSubtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {siteConfig.homepage.ctas.map((cta) => {
            if (cta.path === "/register" && isAuthenticated) return null;
            const cls =
              cta.style === "primary" ? "btn-primary" : cta.style === "secondary" ? "btn-secondary" : "btn-ghost";
            return (
              <Link key={cta.path} to={cta.path} className={cls}>
                {cta.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="page-divider mx-auto max-w-3xl px-5">
        <span className="text-xl">❦</span>
      </div>

      <section className="mx-auto max-w-3xl px-5 pb-24 text-center text-ink/60">
        <p className="text-sm">
          Story shelves, announcements, and the reader community are on their way in the next
          build phase — the account system above is fully live, so feel free to register and log in.
        </p>
      </section>
    </div>
  );
}
