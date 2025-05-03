import React from "react";
import { useTranslation } from "react-i18next";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-box">
        {/* <button className="social-button google" onClick={googleLogin}>
          <FaGoogle className="icon" />
          {t("login.google")}
        </button> */}
        <GoogleLoginButton />

        <div className="login-divider">{t("login.or")}</div>
        <input
          type="email"
          placeholder={t("login.email")}
          className="login-input"
        />
        <input
          type="password"
          placeholder={t("login.password")}
          className="login-input"
        />
        <button className="login-btn">{t("login.login")}</button>
        <div className="bottom-links">
          <a href="/signup">{t("login.signup")}</a>
          <a href="#">{t("login.findId")}</a>
          <a href="#">{t("login.findPw")}</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
