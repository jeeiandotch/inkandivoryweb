import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchPublicSiteSettings } from "../api/publicSettings.js";
import { hexToRgbTriple, lightenHexForDarkMode } from "../utils/color.js";

const SiteContext = createContext(null);

const DARK_MODE_STORAGE_KEY = "ii:dark-mode";

function getInitialDarkMode() {
  const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  const refreshSettings = useCallback(() => {
    return fetchPublicSiteSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshSettings().finally(() => setLoading(false));
  }, [refreshSettings]);

  // Apply accent colors + document title/favicon whenever settings or dark mode change.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode));

    if (!settings) return;

    const applyColor = (varName, hex) => {
      if (!hex) return;
      const value = darkMode ? lightenHexForDarkMode(hex) : hexToRgbTriple(hex);
      root.style.setProperty(varName, value);
    };
    applyColor("--c-primary", settings.primaryColor);
    applyColor("--c-secondary", settings.secondaryColor);
    applyColor("--c-gold", settings.goldColor);

    const gradientLayers =
      "radial-gradient(circle at 12% 8%, rgb(var(--c-primary) / 0.14), transparent 42%), " +
      "radial-gradient(circle at 88% 18%, rgb(var(--c-gold) / 0.08), transparent 40%), " +
      "radial-gradient(circle at 80% 85%, rgb(var(--c-secondary) / 0.09), transparent 45%), " +
      "radial-gradient(circle at 5% 90%, rgb(var(--c-secondary) / 0.08), transparent 40%)";
    const bgImage = settings.backgroundUrl ? `url(${settings.backgroundUrl}), ${gradientLayers}` : gradientLayers;
    root.style.setProperty("--c-bg-image", bgImage);

    if (settings.siteName) document.title = settings.siteName;

    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings, darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((v) => !v), []);

  return (
    <SiteContext.Provider value={{ settings, loading, darkMode, toggleDarkMode, refreshSettings }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within a SiteProvider");
  return ctx;
}
