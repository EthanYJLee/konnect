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
import CategoryBadgeModal from "../components/CategoryBadgeModal";
import StringToColor from "../utils/StringToColor";

// import { Search, Star, ChevronDown, Bookmark, BookmarkCheck, Trash2, Download, Share2, Tag } from "lucide-react"

const HistoryCard = ({ pair, onCategoryUpdate }) => {
  // 상세보기 모달 관리
  const [showDetailModal, setShowDetailModal] = useState(false);
  const handleShowDetailModal = (pair) => {
    setShowDetailModal(true);
  };
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };
  // 카테고리 모달 관리
  const [showCategoryBadgeModal, setShowCategoryBadgeModal] = useState(false);
  const handleShowCategoryBadgeModal = (pair) => {
    setShowCategoryBadgeModal(true);
  };
  const handleCloseCategoryBadgeModal = () => {
    setShowCategoryBadgeModal(false);
  };

  return (
    <div className="pair-card">
      <div className="badge-container">
        <Badge
          pair={pair}
          onClick={() => setShowCategoryBadgeModal(true)}
          style={{ backgroundColor: StringToColor(pair.category) }}
        >
          {pair.category || "기타"}
        </Badge>
      </div>
      <div style={{ height: "20px" }} />
      <div className="pair-section user">
        <p className="history-p">💬 {pair.userMessage.content}</p>
        <span className="timestamp">
          {new Date(pair.userMessage.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="pair-section ai">
        <p className="history-p">🤖 {pair.aiMessage.content}</p>
        <span className="timestamp">
          {new Date(pair.aiMessage.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="history-card-button-row">
        <Button
          variant="outline"
          size="sm"
          className="history-card-button-details"
          onClick={() => handleShowDetailModal({ pair })}
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

      {showDetailModal && (
        <HistoryModal
          show={showDetailModal}
          onClose={handleCloseDetailModal}
          userMessage={pair.userMessage}
          aiMessage={pair.aiMessage}
          createdAt={pair.createdAt}
        />
      )}
      {showCategoryBadgeModal && (
        <CategoryBadgeModal
          show={showCategoryBadgeModal}
          onClose={handleCloseCategoryBadgeModal}
          pair={pair}
          onCategoryUpdate={onCategoryUpdate}

        />
      )}
    </div>
  );
};

export default HistoryCard;
