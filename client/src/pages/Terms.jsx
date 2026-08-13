import LegalPage from "../components/LegalPage.jsx";
import { siteConfig } from "../config/site.config.js";

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="the day this site was built">
      <p>
        By creating an account on {siteConfig.siteName}, you agree to treat other readers
        and the writer with respect — no harassment, spam, or hateful content in comments
        or messages.
      </p>
      <p>
        Stories published here belong to their author. Please don't copy or redistribute
        them without permission.
      </p>
      <p>
        Accounts that violate these terms may be suspended at the writer's discretion.
      </p>
      <p className="text-xs text-ink/40">
        Replace this placeholder with your actual terms before taking the site live — this
        text is a starting point, not legal advice.
      </p>
    </LegalPage>
  );
}
