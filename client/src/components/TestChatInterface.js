import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatInterface.scss";
import { CiSaveDown1 } from "react-icons/ci";

import TypingText from "./TypingText";
import FloatingActionButton from "./FloatingActionButton";
import Button from "./common/Button";
import Input from "./common/Input";
import Message from "./common/Message";
import ThreadList from "./common/ThreadList";

const TestChatInterface = ({ language }) => {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
    getThreadList();
    handleThreadClick(threadId);
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

    setIsLoading(true);
    setInputValue("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3030/api/assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "OpenAI-Beta": "assistants=v1",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          threadId,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        type: "ai",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMessage, aiMessage];
      setMessages(newMessages);

      const pairs = [];
      for (let i = 0; i < newMessages.length; i += 2) {
        pairs.push(newMessages.slice(i, i + 2));
      }
      setMessagePair(pairs);

      if (data.threadId && !threadId) {
        setThreadId(data.threadId);
        localStorage.setItem("assistant_thread", data.threadId);
      }
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
    const sortedMessages = data.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
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
      <Button
        className="drawer-toggle"
        onClick={() => setIsDrawerOpen((prev) => !prev)}
      >
        ☰
      </Button>
      <div className={`chat-sidebar ${isDrawerOpen ? "open" : ""}`}>
        <ThreadList
          threads={threadList}
          currentThreadId={threadId}
          onThreadClick={handleThreadClick}
          onAddThread={handleAddThread}
          showAddButton={showAddThreadButton}
        />
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
                <Message
                  key={idx}
                  content={msg.content}
                  type={msg.type}
                  timestamp={msg.timestamp}
                  isSelected={selectedMessagePair.includes(index)}
                />
              ))}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <Input
            type="text"
            value={inputValue}
            maxLength={100}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("chat.placeholder")}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {t("chat.send")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TestChatInterface;
