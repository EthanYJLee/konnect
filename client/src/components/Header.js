import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "../styles/Header.scss";

const Header = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = React.useState("en");

  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-content">
        <Navbar
          expand="lg"
          className="bg-body-tertiary"
          style={{ justifyContent: "flex" }}
        >
          <Link to="/" className="logo">
            K-Life Assistant
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <nav className="main-nav">
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">{t("nav.home")}</Nav.Link>
                <Nav.Link href="/faq">{t("nav.faq")}</Nav.Link>
                <Nav.Link href="/history">{t("nav.history")}</Nav.Link>
                <Nav.Link href="/settings">{t("nav.settings")}</Nav.Link>
                <Nav.Link href="/test">테스트</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </nav>

          <div className="header-right">
            <button
              className="header-login-btn"
              onClick={() => navigate("/login")}
            >
              {t("nav.login")}
            </button>
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </Navbar>
      </div>
    </header>
  );
};

export default Header;
