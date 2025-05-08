import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatInterface.css";
import ListGroup from "react-bootstrap/ListGroup";
import { CiSaveDown1 } from "react-icons/ci";

import TypingText from "./TypingText";
import FloatingActionButton from "./FloatingActionButton";

const ChatInterface = ({ language }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessagePair, setSelectedMessagePair] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [threadId, setThreadId] = useState(
    localStorage.getItem("assistant_thread") || null
  );

  const [threadList, setThreadList] = useState([]);
  const [showAddThreadButton, setShowAddThreadButton] = useState(false);

  const [messagePair, setMessagePair] = useState([]);

  // initState
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
    getThreadList();
    handleThreadClick(threadId);
  }, []);

  // 이전에 생성된 스레드 목록 가져오기
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

      if (data.list.length > 0 && data.list.length < 3) {
        setShowAddThreadButton(true);
        handleThreadClick(data.list[0].threadId);
      }
      setThreadList(data.list || []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSelectMessage = (index) => {
    setSelectedMessagePair((prev) =>
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

  const handleThreadClick = async (threadId) => {
    localStorage.setItem("assistant_thread", threadId);
    setThreadId(threadId);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:3030/api/assistant/thread/${threadId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    // 메시지 오래된 것부터 최신 순으로 정렬 (default: 최신 -> 오래된 순)
    const sortedMessages = data.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    // console.log(sortedMessages);
    // console.log(messages);
    setMessages(sortedMessages);
    const pairs = [];
    for (let i = 0; i < sortedMessages.length; i += 2) {
      pairs.push(sortedMessages.slice(i, i + 2));
    }
    setMessagePair(pairs);
  };

  const handleAddThread = () => {
    localStorage.removeItem("assistant_thread");
    setThreadId(null);
    setMessages([]);
    setMessagePair([]);
    setSelectedMessagePair([]);
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
                className={`list-group-item list-group-item-action thread-item ${
                  thread.threadId === threadId ? "current-thread" : ""
                }`}
                action
                onClick={() => handleThreadClick(thread.threadId)}
              >
                <div className="thread-content">
                  <span>{thread.title || "제목 없음"}</span>
                </div>
              </ListGroup.Item>
            ))}
            {showAddThreadButton && (
              <ListGroup.Item
                className="list-group-item list-group-item-action thread-item add-thread"
                action
                onClick={handleAddThread}
              >
                <div className="thread-content">
                  <span>+</span>
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      </div>

      <div className={`chat-interface ${isDrawerOpen ? "shrink" : ""}`}>
        <div className="chat-interface-header">
          <TypingText text={t("welcome")} speed={100} />
          <p>{t("welcomeMessage")}</p>
        </div>
        <div className="messages-container">
          {selectedMessagePair.length > 0 && (
            <FloatingActionButton
              onClick={() => {
                console.log("clicked");
              }}
              icon={<CiSaveDown1 />}
              count={selectedMessagePair.length}
            />
          )}
          {messagePair.map((pair, index) => (
            <div
              key={index}
              className="message-pair"
              onClick={() => toggleSelectMessage(index)}
            >
              {pair.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.type} ${
                    selectedMessagePair.includes(index) ? "selected" : ""
                  }`}
                >
                  <div className="message-content">
                    {/* {index},{idx}, */}
                    {msg.content}
                  </div>
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
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

export default ChatInterface;
