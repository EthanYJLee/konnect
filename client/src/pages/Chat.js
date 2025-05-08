import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/Home.css";
import ChatInterface from "../components/ChatInterface";

const Chat = () => {
  return (
    <div className="home-container">
      <div className="chat-container">
        <div className="chat-main">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
};

export default Chat;
