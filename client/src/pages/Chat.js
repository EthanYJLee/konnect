import React from "react";
import { useTranslation } from "react-i18next";
import { Container } from "react-bootstrap";
import "../styles/Chat.scss";
import ChatInterface from "../components/ChatInterface";

const Chat = () => {
  const { t } = useTranslation();

  return (
    <div className="chat-page">
      <Container className="curation-container">
        {/* <div className="page-header">
          <h1>{t("chat.title", "여행 도우미와 대화하기")}</h1>
          <p className="page-subtitle">
            {t(
              "chat.subtitle",
              "한국 여행에 관한 질문이나 도움이 필요한 사항을 자유롭게 물어보세요."
            )}
          </p>
        </div> */}

        <div className="chat-interface-container">
          <ChatInterface />
        </div>
      </Container>
    </div>
  );
};

export default Chat;
