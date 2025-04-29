import React from "react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "../styles/Login.css";

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="container">
      {/* <h2 className="login-text">로그인</h2> */}
      <div className="login-box">
        {/* <button className="social-button kakao">
          <SiKakaotalk className="icon" />
          카카오 계정으로 로그인
        </button> */}
        <button className="social-button google">
          <FaGoogle className="icon" />
          {t("login.google")}
        </button>
        {/* <button className="social-button naver">
          <SiNaver className="icon" />
          네이버 계정으로 로그인
        </button> */}
        {/* <button className="social-button apple">
          <FaApple className="icon" />
          {t("login.apple")}
        </button> */}
        <div className="divider">{t("login.or")}</div>
        <input type="email" placeholder={t("login.email")} className="input" />
        <input
          type="password"
          placeholder={t("login.password")}
          className="input"
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
