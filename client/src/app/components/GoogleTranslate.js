"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      // Remove any existing Google Translate elements
      const existingWidget = document.querySelector('.goog-te-menu-frame');
      if (existingWidget) {
        existingWidget.remove();
      }
      
      // Remove any existing Google Translate script
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create and add new script
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
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
            multilanguagePage: true
          },
          "google_translate_element"
        );
        setIsInitialized(true);
      }
    };

    addGoogleTranslateScript();

    // Cleanup function
    return () => {
      const widget = document.querySelector('.goog-te-menu-frame');
      if (widget) {
        widget.remove();
      }
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) {
        script.remove();
      }
    };
  }, [pathname]); // Re-run effect when pathname changes

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
    const tryTranslate = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        const targetLang = languageCodeMap[langCode];
        select.value = targetLang;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        
        // Force translation by clicking the translate button if it exists
        const translateButton = document.querySelector('.goog-te-menu-value span:first-child');
        if (translateButton) {
          translateButton.click();
        }
        
        setSelectedLang(langCode);
        setIsOpen(false);
      } else {
        console.warn("Google Translate dropdown not found. Retrying...");
        setTimeout(tryTranslate, 500);
      }
    };

    if (isInitialized) {
      tryTranslate();
    } else {
      console.warn("Google Translate is not initialized yet.");
      // Retry initialization
      setTimeout(() => {
        if (window.google && window.google.translate) {
          tryTranslate();
        }
      }, 1000);
    }
  };

  return (
    <div className="relative">
      {/* Visible but off-screen to avoid display:none issues */}
      <div id="google_translate_element" className="absolute opacity-0" />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md bg-white"
      >
        {selectedLang} ▼
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
