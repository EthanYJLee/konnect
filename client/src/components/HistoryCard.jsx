import React, { useState } from "react";
import { Button } from "react-bootstrap";
import "../styles/HistoryCard.scss";
import HistoryModal from "./HistoryModal";
import DatePickerModal from "./DatePickerModal";
import Badge from "./Badge";
import CategoryBadgeModal from "./CategoryBadgeModal";
import StringToColor from "../utils/StringToColor";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTrash, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from "react-i18next";

// import { Search, Star, ChevronDown, Bookmark, BookmarkCheck, Trash2, Download, Share2, Tag } from "lucide-react"

const HistoryCard = ({ pair, onCategoryUpdate }) => {
  const { t } = useTranslation();
  // 상세보기 모달 관리
  const [showDetailModal, setShowDetailModal] = useState(false);
  const handleShowDetailModal = () => setShowDetailModal(true);
  const handleCloseDetailModal = () => setShowDetailModal(false);
  
  // 카테고리 모달 관리
  const [showCategoryBadgeModal, setShowCategoryBadgeModal] = useState(false);
  const handleCloseCategoryBadgeModal = () => setShowCategoryBadgeModal(false);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return date.toLocaleDateString(undefined, options);
  };
  
  // 내용 요약 함수
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleDeleteChat = () => {
    console.log("delete chat");
    
  }

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
      
      <div className="pair-section user">
        <p className="history-p">{truncateText(pair.userMessage.content)}</p>
        <span className="timestamp">{formatDate(pair.userMessage.timestamp)}</span>
      </div>

      <div className="pair-section ai">
        <p className="history-p">{truncateText(pair.aiMessage.content)}</p>
        <span className="timestamp">{formatDate(pair.aiMessage.timestamp)}</span>
      </div>
      
      <div className="history-card-button-row">
        <Button
          className="history-card-button-details"
          onClick={handleShowDetailModal}
        >
          <FontAwesomeIcon icon={faEye} /> {t("history.viewDetails", "자세히 보기")}
        </Button>
        <Button
          className="history-card-button-remove"
          onClick={handleDeleteChat}
        >
          <FontAwesomeIcon icon={faTrash} /> {t("history.delete", "삭제")}
        </Button>
      </div>

      {/* 모달 컴포넌트 */}
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
