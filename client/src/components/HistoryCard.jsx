import React from "react";
import "../styles/HistoryCard.scss";

const HistoryCard = ({ userMessage, aiMessage, createdAt }) => {
  return (
    <div className="pair-card">
      <div className="pair-section user">
        <strong>💬 사용자 질문</strong>
        <p>{userMessage.content}</p>
        <span className="timestamp">
          {new Date(userMessage.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="pair-section ai">
        <strong>🤖 AI 답변</strong>
        <p>{aiMessage.content}</p>
        <span className="timestamp">
          {new Date(aiMessage.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="card-footer">
        저장 일시: {new Date(createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default HistoryCard;
