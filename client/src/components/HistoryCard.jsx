import React, { useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import "../styles/HistoryCard.scss";
import HistoryModal from "../components/HistoryModal";
import "react-datepicker/dist/react-datepicker.css";
import DatePickerModal from "../components/DatePickerModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import format from "date-fns/format";
import Badge from "../components/Badge";

// import { Search, Star, ChevronDown, Bookmark, BookmarkCheck, Trash2, Download, Share2, Tag } from "lucide-react"

const HistoryCard = ({
  pair,
  userMessage,
  aiMessage,
  createdAt,
  onDetailClick,
  onRemoveClick,
}) => {
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPair(null);
  };

  const handleShowModal = (pair) => {
    setSelectedPair(pair);
    setShowModal(true);
  };

  const [selectedPair, setSelectedPair] = useState(null);

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="pair-card">
      <div className="badge-container">
      <Badge
        style={{ backgroundColor: stringToColor(pair.category || "기타") }}
      >
        {pair.category || "기타"}
      </Badge>
      </div>
      {/* <div className="pair-classification-row">
        <div className="classification-group">
          <strong>📍 Location:</strong>
          {["집", "회사", "카페"].map((loc) => (
            <Button
              key={loc}
              size="sm"
              variant={locations.includes(loc) ? "primary" : "outline"}
              onClick={() => {
                setLocations((prev) =>
                  prev.includes(loc)
                    ? prev.filter((l) => l !== loc)
                    : [...prev, loc]
                );
              }}
              className="classification-button"
            >
              {loc}
            </Button>
          ))}
        </div>
      </div> */}
      <div style={{ height: "20px" }} />
      <div className="pair-section user">
        {/* <strong className="history-strong">💬 질문</strong> */}
        <p className="history-p">💬 {pair.userMessage.content}</p>
        <span className="timestamp">
          {new Date(userMessage.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="pair-section ai">
        {/* <strong className="history-strong">🤖 답변</strong> */}
        <p className="history-p">🤖 {pair.aiMessage.content}</p>
        <span className="timestamp">
          {new Date(aiMessage.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="history-card-button-row">
        <Button
          variant="outline"
          size="sm"
          className="history-card-button-details"
          onClick={() => handleShowModal({ userMessage, aiMessage, createdAt })}
        >
          View Details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="history-card-button-remove"
        >
          Remove
        </Button>
      </div>

      {/* <div className="history-card-footer">
        {new Date(createdAt).toLocaleString()}
      </div> */}
      {selectedPair && (
        <HistoryModal
          show={showModal}
          onClose={handleCloseModal}
          userMessage={userMessage}
          aiMessage={aiMessage}
          createdAt={createdAt}
        />
      )}
    </div>
  );
};

export default HistoryCard;
