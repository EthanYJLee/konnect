import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    if (localStorage.getItem("loginType") === "google") {
      // 구글 로그아웃
      localStorage.removeItem("token");
      localStorage.removeItem("assistant_thread");
      localStorage.removeItem("loginType");
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        window.google.accounts.id.disableAutoSelect();
      }

      window.open(
        "https://accounts.google.com/Logout",
        "_blank",
        "width=500,height=600"
      );
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("authChange"));
    } else if (localStorage.getItem("loginType") === "normal") {
      // 일반 로그아웃
      localStorage.removeItem("token");
      localStorage.removeItem("assistant_thread");
      localStorage.removeItem("loginType");
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("authChange"));
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // JWT 만료 타이머 설정
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresAt = payload.exp * 1000;
      const delay = expiresAt - Date.now();

      if (delay > 0) {
        const timeout = setTimeout(() => handleLogout(), delay);
        return () => clearTimeout(timeout);
      } else {
        handleLogout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
