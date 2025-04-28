import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/ThemeSelector.css";

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const { t } = useTranslation();

  const themes = [
    { id: "light", name: t("theme.light"), icon: "☀️" },
    { id: "dark", name: t("theme.dark"), icon: "🌙" },
  ];

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    onThemeChange(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="theme-selector">
      <select
        value={currentTheme}
        onChange={handleThemeChange}
        className="theme-dropdown"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.icon} {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
