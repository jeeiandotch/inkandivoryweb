import { useEffect, useState } from "react";
import LegalPage from "../components/LegalPage.jsx";
import { fetchPublicSiteSettings } from "../api/publicSettings.js";

const DEFAULT_TEXT = "This site hasn't published its terms of service yet. Check back soon.";

export default function Terms() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchPublicSiteSettings()
      .then((s) => setContent(s.termsOfService || ""))
      .catch(() => setContent(""));
  }, []);

  return (
    <LegalPage title="Terms of Service">
      <p className="whitespace-pre-line">{content || DEFAULT_TEXT}</p>
    </LegalPage>
  );
}
