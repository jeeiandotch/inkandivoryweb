import { useEffect, useState } from "react";
import LegalPage from "../components/LegalPage.jsx";
import { fetchPublicSiteSettings } from "../api/publicSettings.js";

const DEFAULT_TEXT = "This site hasn't published a privacy policy yet. Check back soon.";

export default function Privacy() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchPublicSiteSettings()
      .then((s) => setContent(s.privacyPolicy || ""))
      .catch(() => setContent(""));
  }, []);

  return (
    <LegalPage title="Privacy Policy">
      <p className="whitespace-pre-line">{content || DEFAULT_TEXT}</p>
    </LegalPage>
  );
}
