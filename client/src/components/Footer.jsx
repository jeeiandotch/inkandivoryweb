import { Link } from "react-router-dom";
import { siteConfig } from "../config/site.config.js";

const SOCIAL_LABELS = {
  twitter: "Twitter",
  instagram: "Instagram",
  tumblr: "Tumblr",
  ko_fi: "Ko-fi",
  website: "Website",
};

export default function Footer() {
  const activeSocialLinks = Object.entries(siteConfig.social).filter(([, url]) => Boolean(url));
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 bg-ivory/60 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="font-script text-2xl text-ink">{siteConfig.siteName}</p>
          <p className="mt-2 text-sm text-ink/55">{siteConfig.footer.text}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">Explore</p>
          {siteConfig.nav.primary.map((item) => (
            <Link key={item.path} to={item.path} className="text-ink/60 hover:text-taupe-dark">
              {item.label}
            </Link>
          ))}
        </div>

        {activeSocialLinks.length > 0 && (
          <div className="flex flex-col gap-2 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">Elsewhere</p>
            {activeSocialLinks.map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-ink/60 hover:text-taupe-dark">
                {SOCIAL_LABELS[key] || key}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-ink/10 pt-6 text-xs text-ink/40 sm:flex-row">
        <p>© {year} {siteConfig.writer.name}. All rights reserved.</p>
        <div className="flex gap-4">
          {siteConfig.footer.showPrivacyPolicy && (
            <Link to="/privacy" className="hover:text-ink/70">Privacy Policy</Link>
          )}
          {siteConfig.footer.showTermsOfService && (
            <Link to="/terms" className="hover:text-ink/70">Terms of Service</Link>
          )}
        </div>
      </div>
    </footer>
  );
}
