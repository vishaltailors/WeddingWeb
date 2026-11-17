import { useLanguage } from "./i18n";
import { downloadInvitationCard } from "./invitation-card";
import { ChevronDown, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const languages = [
  { value: "en", label: "English" },
  { value: "gu", label: "Gujarati" },
];

/** Downloads the invitation card as a PNG, in either language. */
export default function InvitationDownload({ wedding }) {
  const { t } = useLanguage();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const label = t("Download invitation card");

  useEffect(() => {
    const closeOutside = (event) => {
      if (!menuRef.current.contains(event.target)) menuRef.current.open = false;
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && menuRef.current.open) {
        menuRef.current.open = false;
        triggerRef.current.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function download(language) {
    if (busy) return;
    setBusy(true);
    try {
      await downloadInvitationCard(wedding, language);
    } finally {
      setBusy(false);
      menuRef.current.open = false;
      triggerRef.current.focus();
    }
  }

  return (
    <details
      className="theme-menu download-menu"
      ref={menuRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          event.currentTarget.open = false;
      }}
    >
      <summary
        className="theme-trigger download-trigger"
        ref={triggerRef}
        aria-label={label}
      >
        <Download size={17} aria-hidden="true" />
        <span className="download-trigger-label">{label}</span>
        <ChevronDown size={12} aria-hidden="true" />
      </summary>
      <fieldset className="theme-options">
        <legend>{t("Invitation card language")}</legend>
        {languages.map(({ value, label: name }) => (
          <button
            key={value}
            type="button"
            className="theme-option"
            disabled={busy}
            onClick={() => download(value)}
          >
            <Download size={16} aria-hidden="true" />
            <span>{t(name)}</span>
          </button>
        ))}
      </fieldset>
    </details>
  );
}
