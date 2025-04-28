import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/LanguageSelector.css";

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English" },
    { code: "ko", name: "한국어" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
    { code: "vi", name: "Tiếng Việt" },
  ];

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    onLanguageChange(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="language-selector">
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="language-dropdown"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
