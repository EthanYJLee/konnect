import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatInterface.css";

import TypingText from "./TypingText";

const TestChatInterface = ({ language }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [threadId, setThreadId] = useState(
    localStorage.getItem("assistant_thread") || null
  );

  const toggleSelectMessage = (index) => {
    setSelectedMessages((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      type: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("토큰:", token);
      console.log("스레드:", threadId);
      const response = await fetch("http://localhost:3030/api/assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "OpenAI-Beta": "assistants=v1",
        },
        body: JSON.stringify({ messages: updatedMessages, threadId }),
      });
      console.log(response);

      const data = await response.json();

      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
        localStorage.setItem("assistant_thread", data.threadId);
      }

      const aiMessage = {
        type: "ai",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting assistant response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <TypingText text={t("welcome")} speed={100} />
      <p>{t("welcomeMessage")}</p>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type} ${
              selectedMessages.includes(index) ? "selected" : ""
            }`}
            onClick={() => toggleSelectMessage(index)}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai loading">{t("chat.thinking")}...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          maxLength={100}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("chat.placeholder")}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>
          {t("chat.send")}
        </button>
      </form>
    </div>
  );
};

export default TestChatInterface;
