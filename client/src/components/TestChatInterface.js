import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatInterface.css";
import ListGroup from "react-bootstrap/ListGroup";

import TypingText from "./TypingText";

const TestChatInterface = ({ language }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [threadId, setThreadId] = useState(
    // localStorage.getItem("assistant_thread") || null
    null
  );

  const [threadList, setThreadList] = useState([]);

  // initState
  useEffect(() => {
    getThreadList();
  }, []);

  const getThreadList = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3030/api/assistant/threadList",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      //   console.log(data);
      setThreadList(data.list || []);
    } catch (error) {
      console.error(error);
    }
  };

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
      const response = await fetch("http://localhost:3030/api/assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "OpenAI-Beta": "assistants=v1",
        },
        body: JSON.stringify({ messages: updatedMessages, threadId }),
      });

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

  const handleThreadClick = (threadId) => {
    console.log(threadId);
  };

  return (
    <div className="chat-wrapper">
      <button
        className="drawer-toggle"
        onClick={() => setIsDrawerOpen((prev) => !prev)}
      >
        ☰
      </button>
      <div className={`chat-sidebar ${isDrawerOpen ? "open" : ""}`}>
        <div className="sidebar-list">
          <ListGroup>
            {threadList.map((thread) => (
              <ListGroup.Item
                key={thread._id}
                action
                onClick={() => handleThreadClick(thread._id)}
              >
                {thread.title || "(제목 없음)"}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>

      <div className={`chat-interface ${isDrawerOpen ? "shrink" : ""}`}>
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
    </div>
  );
};

export default TestChatInterface;
