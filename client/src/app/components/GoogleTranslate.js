"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN"); // Default to "EN"
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      // Remove existing Google Translate elements
      const existingWidget = document.querySelector(".goog-te-menu-frame");
      if (existingWidget) existingWidget.remove();

      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) existingScript.remove();

      // Add new script
      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,fr,es,de,ar,zh-CN,ja",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
        setIsInitialized(true);
        // Set initial language to English
        setSelectedLang("EN");
      }
    };

    addGoogleTranslateScript();

    // Cleanup
    return () => {
      const widget = document.querySelector(".goog-te-menu-frame");
      if (widget) widget.remove();
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) script.remove();
    };
  }, [pathname]);

  const languageCodeMap = {
    EN: "en",
    FR: "fr",
    ES: "es",
    DE: "de",
    AR: "ar",
    ZH: "zh-CN",
    JA: "ja",
  };

  const languageNames = {
    EN: "English",
    FR: "Français",
    ES: "Español",
    DE: "Deutsch",
    AR: "العربية",
    ZH: "中文",
    JA: "日本語",
  };

  const handleLanguageChange = (langCode) => {
    console.log("Selected language:", langCode); // Debug log
    const tryTranslate = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        const targetLang = languageCodeMap[langCode];
        select.value = targetLang;
        const event = new Event("change", { bubbles: true });
        select.dispatchEvent(event);

        // Force translation
        const translateButton = document.querySelector(".goog-te-menu-value span:first-child");
        if (translateButton) translateButton.click();

        setSelectedLang(langCode); // Set state to the selected language code (e.g., "EN")
        console.log("Updated selectedLang:", langCode); // Debug log
        setIsOpen(false);
      } else {
        console.warn("Google Translate dropdown not found. Retrying...");
        setTimeout(tryTranslate, 500);
      }
    };

    if (isInitialized) {
      tryTranslate();
    } else {
      console.warn("Google Translate not initialized. Retrying...");
      setTimeout(() => {
        if (window.google && window.google.translate) {
          tryTranslate();
        }
      }, 1000);
    }
  };

  return (
    <div className="relative">
      <div id="google_translate_element" className="absolute opacity-0" />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md bg-white"
      >
        {languageNames[selectedLang] || selectedLang} ▼ {/* Display full name or code */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-32">
          {Object.keys(languageCodeMap).map((code) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
            >
              {languageNames[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}