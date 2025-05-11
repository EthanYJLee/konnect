import React, { useRef } from "react";
import Button from "react-bootstrap/Button";
import "../styles/HistoryCard.scss";

// import { Search, Star, ChevronDown, Bookmark, BookmarkCheck, Trash2, Download, Share2, Tag } from "lucide-react"

const HistoryCard = ({ userMessage, aiMessage, createdAt }) => {
  return (
    <div className="pair-card">
      <div className="pair-section user">
        <strong className="history-strong">💬 질문</strong>
        <p className="history-p">{userMessage.content}</p>
        <span className="timestamp">
          {new Date(userMessage.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="pair-section ai">
        <strong className="history-strong">🤖 답변</strong>
        <p className="history-p">{aiMessage.content}</p>
        <span className="timestamp">
          {new Date(aiMessage.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          style={{ color: "black", backgroundColor: "white", border: "red" }}
        >
          View Details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          style={{ color: "black", backgroundColor: "white", border: "red" }}
        >
          Remove
        </Button>
      </div>

      <div className="history-card-footer">
        {new Date(createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default HistoryCard;
