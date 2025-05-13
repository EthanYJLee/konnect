import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/Home.css";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home-container">
      <div className="chat-container">
        {/* <h1>{t("welcome")}</h1>
        <p>{t("welcomeMessage")}</p> */}
        {/* <ChatInterface language={language} /> */}
      </div>
    </div>
  );
};

export default Home;
