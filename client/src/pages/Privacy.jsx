import LegalPage from "../components/LegalPage.jsx";
import { siteConfig } from "../config/site.config.js";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="the day this site was built">
      <p>
        {siteConfig.siteName} collects only what's needed to run your account: your email,
        username, and anything you choose to add to your profile. Your password is hashed
        and never stored in plain text.
      </p>
      <p>
        Reading activity, comments, favorites, and bookmarks are stored so the site can
        show them back to you. Messages are visible only to the people in the conversation.
      </p>
      <p>
        We don't sell your data or share it with advertisers. If you'd like your account
        and its data removed, contact the writer through the site's messaging system.
      </p>
      <p className="text-xs text-ink/40">
        Replace this placeholder with your actual policy before taking the site live — this
        text is a starting point, not legal advice.
      </p>
    </LegalPage>
  );
}
