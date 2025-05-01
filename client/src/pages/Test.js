import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Test = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const toggleSelectMessage = (index) => {
    setSelectedMessages((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = async (e) => {
    if (!inputValue.trim()) return;
    
  };

  return (
    <div className="chat-interface">
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
export default Test;
