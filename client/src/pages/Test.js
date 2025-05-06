import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/Home.css";
import TestChatInterface from "../components/TestChatInterface";

const Test = () => {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");

  return (
    <div className="home-container">
      <div className="chat-container">
        <div className="chat-main">
          <TestChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Test;
