"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export const LANGUAGES = [
  { code: "en", label: "English", flag: "gb" },
  { code: "es", label: "Spanish", flag: "es" },

];

const GoogleTranslate: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    if ((window as any).googleTranslateElementInit) return;

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          layout: (window as any).google.translate.TranslateElement.InlineLayout
            .SIMPLE,
        },
        "google_translate_element"
      );
    };
  }, []);

  useEffect(() => {
    const hideGoogleElements = () => {
      const iframe = document.querySelector("iframe.goog-te-banner-frame");
      const body = document.body;

      if (iframe instanceof HTMLIFrameElement) {
        iframe.style.display = "none";
      }
      if (body instanceof HTMLElement) {
        body.style.top = "0px";
      }

      const googleFrame = document.querySelector(".goog-te-gadget-icon");
      if (googleFrame instanceof HTMLElement) {
        googleFrame.style.display = "none";
      }
    };

    const interval = setInterval(hideGoogleElements, 300);
    setTimeout(() => clearInterval(interval), 5000);
    hideGoogleElements();
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
    const lang = match ? match[1] : "en";
    setCurrentLang(lang);
  }, []);

  const handleChange = (lang: string) => {
    setCurrentLang(lang);
    setOpen(false);

    document.cookie = `googtrans=/en/${lang};path=/;domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${lang};path=/;`;
    window.location.reload();
  };

  const selectedLang = LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div className="pl-1 relative inline-block text-left">
      {/* Language Selector Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm shadow-sm transition text-white"
      >
        {selectedLang && (
          <img
            src={`https://flagcdn.com/w20/${selectedLang.flag}.png`}
            width={20}
            height={15}
            alt={selectedLang.label}
            className="rounded-xs"
          />
        )}
        <span>{selectedLang?.label}</span>
        <FiChevronDown
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-8 left-20 z-99 w-36 rounded-lg border border-gray-200 bg-white shadow-lg dark:bg-gray-900">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <img
                src={`https://flagcdn.com/w20/${lang.flag}.png`}
                width={20}
                height={15}
                alt={lang.label}
                className="rounded-sm"
              />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hidden Google Translate Element */}
      <div
        id="google_translate_element"
        style={{ position: "absolute", left: "-9999px", top: 0 }}
      />
    </div>
  );
};

export default GoogleTranslate;
