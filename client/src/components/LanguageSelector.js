import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/LanguageSelector.css";
import Dropdown from "react-bootstrap/Dropdown";

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  ];

  const handleLanguageChange = (langCode) => {
    onLanguageChange(langCode);
    i18n.changeLanguage(langCode);
  };

  const currentLang =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  return (
    <Dropdown className="language-selector">
      <Dropdown.Toggle
        variant="light"
        id="language-dropdown"
        className="language-dropdown"
      >
        {currentLang.flag} {currentLang.name}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {languages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            active={currentLanguage === lang.code}
          >
            {lang.flag} {lang.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSelector;
