import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import "../styles/Header.css";

const Header = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = React.useState("en");

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          K-Life Assistant
        </Link>

        <nav className="main-nav">
          <Link to="/">{t("nav.home")}</Link>
          <Link to="/faq">{t("nav.faq")}</Link>
          <Link to="/history">{t("nav.history")}</Link>
          <Link to="/settings">{t("nav.settings")}</Link>
        </nav>

        <div className="header-right">
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={setLanguage}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
