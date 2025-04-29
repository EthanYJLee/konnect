import React from "react";
// import { FaGoogle, FaApple } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "../styles/Signup.css";

const Signup = () => {
  const { t } = useTranslation();

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h2 className="signup-title">{t("login.signup")}</h2>

        <div className="email-check-row">
          <input
            type="email"
            placeholder={t("signup.email")}
            className="input"
          />
          <button className="check-duplicate-btn">
            {t("signup.checkDuplicate")}
          </button>
        </div>
        <input type="name" placeholder={t("signup.name")} className="input" />
        <input
          type="password"
          placeholder={t("signup.password")}
          className="input"
        />
        <input
          type="password"
          placeholder={t("signup.confirmPassword")}
          className="input"
        />
        <button className="signup-btn">{t("login.signup")}</button>
        <div className="bottom-links">
          <a href="#">{t("login.login")}</a>
          <a href="#">{t("login.findId")}</a>
          <a href="#">{t("login.findPw")}</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
