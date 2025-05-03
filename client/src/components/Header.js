import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import "../styles/Header.scss";
import { useTheme } from "../contexts/ThemeContext";

const Header = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = React.useState("en");
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();

  // 로그인 버튼 관리
  const [isLoggedIn, setIsLoggedIn] = React.useState(
    !!localStorage.getItem("token")
  );

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("token");
    // 구글 자동 로그인 세션 해제
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    window.open(
      "https://accounts.google.com/Logout",
      "_blank",
      "width=500,height=600"
    );
    setIsLoggedIn(false);
  };

  React.useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // 기존 storage 이벤트 + 커스텀 이벤트 둘 다 등록
    window.addEventListener("storage", updateLoginStatus);
    window.addEventListener("authChange", updateLoginStatus);

    return () => {
      window.removeEventListener("storage", updateLoginStatus);
      window.removeEventListener("authChange", updateLoginStatus);
    };
  }, []);

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
            {isLoggedIn ? (
              <button className="header-login-btn" onClick={handleLogout}>
                {t("nav.logout")}
              </button>
            ) : (
              <button
                className="header-login-btn"
                onClick={() => navigate("/login")}
              >
                {t("nav.login")}
              </button>
            )}
            <button onClick={toggleTheme} className="theme-toggle-button">
              {theme === "light" ? "🌙" : "☀️"}
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
