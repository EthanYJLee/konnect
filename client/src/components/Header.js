import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import "../styles/Header.scss";
import { useTheme } from "../contexts/ThemeContext";
import AlertModal from "../components/AlertModal";
import { useAuth } from "../contexts/AuthContext";
import { FaUser } from "react-icons/fa";
import Toast from "./Toast";

const Header = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const { theme, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userPicture, setUserPicture] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { isLoggedIn, handleLogout } = useAuth();

  // 토스트 메시지 표시 함수
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  // 토스트 메시지 제거 함수
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // URL 정리 함수 - URL 인코딩 문제 해결
  const cleanImageUrl = useCallback((url) => {
    if (!url) return null;

    try {
      // URL 디코딩하여 %20 등의 문자 정리
      const decodedUrl = decodeURIComponent(url);
      // 불필요한 공백 제거
      return decodedUrl.trim();
    } catch (error) {
      console.error("URL 디코딩 오류:", error);
      return url; // 오류 발생 시 원래 URL 반환
    }
  }, []);

  // 프로필 이미지 업데이트 함수
  const updateProfileImage = useCallback(() => {
    if (isLoggedIn) {
      const picture = localStorage.getItem("userPicture");
      if (picture) {
        // URL 정리 후 저장
        const cleanedUrl = cleanImageUrl(picture);

        // localStorage에 정리된 URL 저장 (필요한 경우)
        if (cleanedUrl !== picture) {
          localStorage.setItem("userPicture", cleanedUrl);
        }

        // 이미지 URL 설정 (비동기적으로 실행됨)
        setTimeout(() => {
          setUserPicture(cleanedUrl);
          setImageError(false);
        }, 0);
      }
    } else {
      setUserPicture(null);
      setImageError(false);
    }
  }, [isLoggedIn, cleanImageUrl]);

  // 컴포넌트 마운트 시 프로필 이미지 로드
  useEffect(() => {
    updateProfileImage();

    // 인증 상태 변경 시 이미지 업데이트를 위한 이벤트 리스너
    window.addEventListener("authChange", updateProfileImage);
    window.addEventListener("storage", updateProfileImage);

    return () => {
      window.removeEventListener("authChange", updateProfileImage);
      window.removeEventListener("storage", updateProfileImage);
    };
  }, [updateProfileImage]);

  // 라우터 위치 변경 시 이미지 재로드
  useEffect(() => {
    if (isLoggedIn) {
      updateProfileImage();
    }
  }, [location.pathname, isLoggedIn, updateProfileImage]);

  // isLoggedIn이 변경될 때마다 프로필 이미지 업데이트
  useEffect(() => {
    updateProfileImage();

    // 로그인/로그아웃 시 토스트 표시
    const prevLoginState = localStorage.getItem("prevLoginState");
    const currentLoginState = isLoggedIn ? "true" : "false";

    if (prevLoginState !== null && prevLoginState !== currentLoginState) {
      if (isLoggedIn) {
        showToast(t("toast.loginSuccess"), "success");
      } else {
        showToast(t("toast.logoutSuccess"), "success");
      }
    }

    localStorage.setItem("prevLoginState", currentLoginState);
  }, [isLoggedIn, updateProfileImage, t]);

  // 이미지 로드 오류 핸들러
  const handleImageError = () => {
    console.error("프로필 이미지 로드 실패");
    setImageError(true);

    // 이미지 URL 확인 및 디버깅
    const currentUrl = localStorage.getItem("userPicture");
    console.log("현재 이미지 URL:", currentUrl);

    // 일정 시간 후 한 번 더 로딩 시도
    setTimeout(() => {
      updateProfileImage();
    }, 1000);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleUserProfileClick = () => {
    setShowDropdown(!showDropdown);
    // 드롭다운 클릭 시 이미지 다시 확인
    updateProfileImage();
  };

  // 로그아웃 처리 함수
  const handleLogoutClick = () => {
    handleLogout();
    setShowDropdown(false);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Navbar
          expand="lg"
          className={`bg-body-tertiary ${theme}`}
          Navbar
          style={{ justifyContent: "flex" }}
        >
          <Link to="/" className="logo">
            Konnect
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <nav className="main-nav">
            <Navbar.Collapse
              id="basic-navbar-nav"
              className={`basic-navbar-nav ${theme}`}
            >
              <Nav className="me-auto">
                <Nav.Link href="/" className={isActive("/") ? "active" : ""}>
                  {t("nav.home")}
                </Nav.Link>
                <Nav.Link
                  href="/curation"
                  className={isActive("/curation") ? "active" : ""}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      setShowModal(true);
                    }
                  }}
                >
                  {t("nav.curation")}
                </Nav.Link>
                <Nav.Link
                  href="/chat"
                  className={isActive("/chat") ? "active" : ""}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      setShowModal(true);
                    }
                  }}
                >
                  {t("nav.chat")}
                </Nav.Link>
                <Nav.Link
                  href="/history"
                  className={isActive("/history") ? "active" : ""}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      setShowModal(true);
                    }
                  }}
                >
                  {t("nav.history")}
                </Nav.Link>
                <Nav.Link
                  href="/faq"
                  className={isActive("/faq") ? "active" : ""}
                >
                  {t("nav.faq")}
                </Nav.Link>
                {/* <Nav.Link href="/settings">{t("nav.settings")}</Nav.Link> */}
              </Nav>
            </Navbar.Collapse>
          </nav>

          <div className="header-right">
            {isLoggedIn ? (
              <div className="user-profile-container" ref={dropdownRef}>
                <div
                  className="user-profile-image"
                  onClick={handleUserProfileClick}
                >
                  {userPicture && !imageError ? (
                    <img
                      src={userPicture}
                      alt="User profile"
                      onError={handleImageError}
                      key={`profile-${userPicture}`} // 이미지 URL이 변경될 때 강제로 다시 로드
                      crossOrigin="anonymous" // CORS 문제 해결을 위한 속성 추가
                      referrerPolicy="no-referrer" // Google 이미지 로드 문제 해결
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                {showDropdown && (
                  <div className="user-dropdown">
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/profile");
                        setShowDropdown(false);
                      }}
                    >
                      {t("nav.userProfile")}
                    </div>
                    <div className="dropdown-item" onClick={handleLogoutClick}>
                      {t("nav.logout")}
                    </div>
                  </div>
                )}
              </div>
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
        <AlertModal
          show={showModal}
          onClose={() => setShowModal(false)}
          title={t("alertModal.login")}
          body={t("alertModal.pleaseLogin")}
        />

        {/* 토스트 메시지 컨테이너 */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
