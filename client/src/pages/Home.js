import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ChatInterface from "../components/ChatInterface";
import "../styles/Home.css";

const Home = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");

  return (
    <div className="home-container">

      <div className="chat-container">
        {/* <h1>{t("welcome")}</h1>
        <p>{t("welcomeMessage")}</p> */}
        <ChatInterface language={language} />
      </div>
    </div>
  );
};

export default Home;
