import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin } = useAuth();

  const handleGeneralLogin = () => {
    console.log("일반 로그인 진행");
    console.log("email:", email);
    console.log("password:", password);
    axios
      .post("http://localhost:3030/api/auth/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log("로그인 성공:", response.data);
        localStorage.setItem("loginType", "normal");
        localStorage.setItem("token", response.data.token);
        window.dispatchEvent(new Event("authChange"));
        handleLogin();
        navigate("/");
      })
      .catch((error) => {
        console.error("로그인 실패:", error);
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <GoogleLoginButton />

        <div className="login-divider">{t("login.or")}</div>
        <input
          type="email"
          placeholder={t("login.email")}
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("login.password")}
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-btn" onClick={handleGeneralLogin}>
          {t("login.login")}
        </button>
        <div className="bottom-links">
          <a href="/signup">{t("login.signup")}</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
