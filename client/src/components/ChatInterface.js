import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatInterface.css";

const ChatInterface = ({ language }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      type: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // TODO: Implement actual API call to backend
      const response = await simulateAIResponse(inputValue);

      const aiMessage = {
        type: "ai",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const simulateAIResponse = async (question) => {
  //   // Simulate API delay
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //   return `This is a simulated response to: "${question}"`;
  // };
  const simulateAIResponse = async (question) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const endpoint = process.env.REACT_APP_OPENAI_API_ENDPOINT;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for foreigners living in Korea. Answer in simple and clear sentences.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.3,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response Error Text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.choices[0].message.content.trim();
      return aiReply;
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      return "Sorry, I couldn't get an answer right now.";
    }
  };

  return (
    <div className="chat-interface">
      <p></p>
      <h1>{t("welcome")}</h1>
      <p>{t("welcomeMessage")}</p>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
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

export default ChatInterface;
