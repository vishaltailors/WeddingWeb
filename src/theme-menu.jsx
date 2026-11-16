import { useLanguage } from "./i18n";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef } from "react";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System default", icon: Monitor },
];

export default function ThemeMenu({ theme, onChange }) {
  const { t } = useLanguage();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const Icon = options.find((option) => option.value === theme).icon;

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

  return (
    <details
      className="theme-menu"
      ref={menuRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          event.currentTarget.open = false;
      }}
    >
      <summary
        className="theme-trigger"
        ref={triggerRef}
        aria-label={t("Choose theme, current preference: {{theme}}", {
          theme: t(options.find((option) => option.value === theme).label),
        })}
      >
        <Icon size={17} aria-hidden="true" />
        <ChevronDown size={12} aria-hidden="true" />
      </summary>
      <fieldset className="theme-options">
        <legend>{t("Appearance")}</legend>
        {options.map(({ value, label, icon }) => {
          const OptionIcon = icon;
          return (
            <button
              type="button"
              className="theme-option"
              key={value}
              aria-pressed={theme === value}
              onClick={() => {
                onChange(value);
                menuRef.current.open = false;
                triggerRef.current.focus();
              }}
            >
              <OptionIcon size={16} aria-hidden="true" />
              <span>{t(label)}</span>
              {theme === value && <Check size={14} aria-hidden="true" />}
            </button>
          );
        })}
      </fieldset>
    </details>
  );
}
