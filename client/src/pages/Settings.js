import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/Settings.css";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="settings-modern-container">
      <div className="settings-columns">
        {/* <div className="settings-col">
          <h2>{t("settings.language")}</h2>
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </div> */}
        <div className="settings-col">
          <h2>{t("settings.theme")}</h2>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "light" ? t("theme.dark") : t("theme.light")}
          </button>
        </div>
        <div className="settings-col">
          <h2>{t("settings.notifications")}</h2>
          <div className="notification-settings">
            <label>
              <input type="checkbox" />
              {t("settings.enableNotifications")}
            </label>
          </div>
        </div>
      </div>
      <div className="settings-footer">
        <hr />
        <p>© 2024 K-Life Assistant. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Settings;
