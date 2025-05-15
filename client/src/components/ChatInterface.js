// ✅ ChatInterface.jsx 수정: FAB가 messages-container의 실제 스크롤 가능한 영역(늘어난 높이 기준) 안에서 항상 우측 하단에 보이도록 조정

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatInterface.scss";
import { Modal } from "react-bootstrap";
import { CiSaveDown1 } from "react-icons/ci";
import axios from "axios";

import TypingText from "./TypingText";
import FloatingActionButton from "./FloatingActionButton";
import SavePairModal from "./SavePairModal";
import Button from "./common/Button";
import Input from "./common/Input";
import Message from "./common/Message";
import ThreadList from "./common/ThreadList";

const ChatInterface = ({ language }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessagePairIndex, setSelectedMessagePairIndex] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [threadId, setThreadId] = useState(
    localStorage.getItem("assistant_thread") || null
  );
  const [threadList, setThreadList] = useState([]);
  const [showAddThreadButton, setShowAddThreadButton] = useState(false);
  const [messagePair, setMessagePair] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const messageContainerRef = useRef(null);

  const scrollToBottom = () => {
    const container = messageContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
    getThreadList();
    handleThreadClick(threadId);
    scrollToBottom();
  }, []);

  useEffect(() => {
    const pairs = [];
    for (let i = 0; i < messages.length; i += 2) {
      pairs.push(messages.slice(i, i + 2));
    }
    setMessagePair(pairs);
    scrollToBottom();
  }, [messages]);

  const getThreadList = async () => {
    const token = localStorage.getItem("token");
    try {
      const url = process.env.REACT_APP_WAS_URL;
      const response = await axios.get(`${url}/api/assistant/threadList`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
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
    setSelectedMessagePairIndex((prev) =>
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

    const thinkingMessage = {
      type: "ai",
      content: t("chat.thinking") + "...",
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    const updatedMessages = [...messages, userMessage, thinkingMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);
    scrollToBottom();

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

      setMessages((prev) => [...prev.slice(0, -1), aiMessage]);
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
    const url = process.env.REACT_APP_WAS_URL;
    const response = await fetch(`${url}/api/assistant/thread/${threadId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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
    setSelectedMessagePairIndex([]);
  };

  return (
    <div className="chat-wrapper">
      <Button
        className="drawer-toggle"
        style={{ fontSize: "1.5rem" }}
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

        <div className="messages-container" ref={messageContainerRef}>
          <div className="message-list">
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
                    isSelected={selectedMessagePairIndex.includes(index)}
                  />
                ))}
              </div>
            ))}
          </div>

          {selectedMessagePairIndex.length > 0 && (
            <div
              style={{
                position: "sticky",
                bottom: "0.1rem",
                right: "0.1rem",
                display: "flex",
                justifyContent: "flex-end",
                zIndex: 10,
                // paddingRight: "1rem",
              }}
            >
              <FloatingActionButton
                onClick={handleShowModal}
                icon={<CiSaveDown1 />}
                count={selectedMessagePairIndex.length}
              />
            </div>
          )}
        </div>

        <SavePairModal
          show={showModal}
          onClose={handleCloseModal}
          selectedMessagePairIndex={selectedMessagePairIndex}
          messagePair={messagePair}
        />

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

export default ChatInterface;
