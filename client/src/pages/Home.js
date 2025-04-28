import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ChatInterface from "../components/ChatInterface";
import LanguageSelector from "../components/LanguageSelector";
import "../styles/Home.css";

const Home = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");

  const [message, setMessage] = useState("");

  const fetchData = () => {
    axios
      .get("http://localhost:3030/api")
      .then((response) => {
        console.log(response.data);
        setMessage(response.data); // 서버에서 받은 메시지
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div className="home-container">
      {/* <div className="language-selector-container">
        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={setLanguage}
        />
      </div> */}
      <p>{message}</p>
      <button onClick={fetchData}></button>
      <div className="chat-container">
        <h1>{t("welcome")}</h1>
        <p>{t("welcomeMessage")}</p>
        <ChatInterface language={language} />
      </div>
    </div>
  );
};

export default Home;
