import React, { useRef, useState, useEffect } from "react";
import ItineraryMap from "./ItineraryMap";
import "../styles/ItineraryModal.scss";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";
import Toast from "./Toast";

const ItineraryModal = ({ isOpen, onClose, itinerary, formatDisplayDate }) => {
  const token = localStorage.getItem("token");
  const modalRef = useRef(null);
  const [animateOut, setAnimateOut] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState({});
  const [activeDate, setActiveDate] = useState(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  // 토스트 관련 상태 추가
  const [toasts, setToasts] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // 토스트 메시지 표시 함수
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  // 토스트 메시지 제거 함수
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // 모달 외부 클릭 시 닫기
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  // ESC 키 누르면 모달 닫기
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  // 모달 닫기 애니메이션 처리
  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setAnimateOut(false);
      onClose();
    }, 300);
  };

  // 저장 버튼 클릭 핸들러
  const handleSave = async() => {
    // 이미 저장된 상태라면 함수 실행 중단
    if (isSaved) {
      return;
    }
    
    // 저장 기능 구현
    console.log("Save itinerary:", itinerary);
    try {
      const response = await axios.post(`${process.env.REACT_APP_WAS_URL}/api/curation/saveItinerary`, 
        { data: itinerary }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
      setIsSaved(true);
      // 성공 메시지를 토스트로 표시
      showToast(t("curation.saveSuccess", "Itinerary saved successfully!"), "success");
    } catch(error) {
      console.log(error);
      // 실패 메시지를 토스트로 표시
      showToast(t("curation.saveError", "Failed to save itinerary. Please try again."), "error");
    }
  };

  // 지도 로딩 완료 핸들러
  const handleMapLoaded = (date) => {
    setMapsLoaded((prev) => ({ ...prev, [date]: true }));
  };

  // 스팟 번호에 사용할 그라데이션 색상 생성
  const getSpotColor = (index, total) => {
    // 기본 프라이머리 컬러를 사용하되, 인덱스에 따라 약간씩 변화를 줌
    if (total <= 1) return "var(--primary-color)";

    const colors = [
      "#4285F4", // 구글 블루
      "#5B9BD5", // 밝은 파랑
      "#3F51B5", // 인디고
      "#7986CB", // 밝은 인디고
      "#2196F3", // 파랑
      "#03A9F4", // 라이트 블루
    ];

    return colors[index % colors.length];
  };

  // 날짜 탭 클릭 핸들러
  const handleDateClick = (date) => {
    setActiveDate(date);
  };

  // 첫 번째 날짜를 기본으로 선택
  useEffect(() => {
    if (isOpen && Object.keys(itinerary).length > 0) {
      const sortedDates = Object.keys(itinerary).sort();
      if (sortedDates.length > 0 && !activeDate) {
        setActiveDate(sortedDates[0]);
      }
    }
  }, [isOpen, itinerary, activeDate]);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때마다 저장 상태 초기화
      setIsSaved(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // 모달 열릴 때 페이지 스크롤 방지
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto"; // 모달 닫힐 때 페이지 스크롤 복원
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClasses = `itinerary-modal-overlay ${
    animateOut ? "animate-out" : ""
  } ${theme === "dark" ? "dark-theme" : ""}`;
  
  const containerClasses = `itinerary-modal-container ${
    animateOut ? "animate-out" : ""
  }`;

  const sortedDates = Object.keys(itinerary).sort();

  const saveButtonClass = isSaved ? "save-btn-saved" : "save-btn";
  const saveButtonText = isSaved ? `✓ ${t("curation.saved", "Saved")}` : t("curation.save", "Save");


  return (
    <div className={modalClasses}>
      <div className={containerClasses} ref={modalRef}>
        <div className="itinerary-modal-header">
          <h2>{t("curation.itineraryResults", "Your Travel Itinerary")}</h2>
          <div className="itinerary-modal-actions">
            <button className={saveButtonClass} onClick={handleSave}>
              {saveButtonText}
            </button>
            <button className="itinerary-modal-close" onClick={handleClose}>
              ⓧ
            </button>
          </div>
        </div>
        
        {sortedDates.length > 0 && (
          <div className="itinerary-date-tabs">
            {sortedDates.map((date) => (
              <button
                key={`tab-${date}`}
                className={`date-tab ${activeDate === date ? "active" : ""}`}
                onClick={() => handleDateClick(date)}
              >
                <span className="tab-date">{formatDisplayDate(date)}</span>
                <span className="tab-spots-count">
                  {itinerary[date].length} {t("curation.spots", "spots")}
                </span>
              </button>
            ))}
          </div>
        )}
        
        <div className="itinerary-modal-content">
          {activeDate && (
            <div className="itinerary-day-card active">
              <div className="itinerary-date">{formatDisplayDate(activeDate)}</div>

              {itinerary[activeDate].length > 0 ? (
                <>
                  <div className="itinerary-content-container">
                    <div className="day-spots-container">
                      {itinerary[activeDate].map((spot, index) => (
                        <div
                          key={`${activeDate}-${index}`}
                          className="itinerary-spot"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div
                            className="spot-number"
                            style={{
                              backgroundColor: getSpotColor(
                                index,
                                itinerary[activeDate].length
                              ),
                            }}
                          >
                            {index + 1}
                          </div>
                          <div className="spot-details">
                            <div className="spot-name">{spot.spot}</div>
                            <div className="spot-location">
                              {spot.city}{" "}
                              {spot.district && `• ${spot.district}`}{" "}
                              {spot.neighborhood && spot.neighborhood.length > 0 && 
                                `• ${Array.isArray(spot.neighborhood) ? spot.neighborhood.join(' ') : spot.neighborhood}`}
                            </div>
                            {spot.category === "32" && (
                              <div className="spot-accommodation-badge">
                                {t("curation.accommodation", "Accommodation")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="day-map-container">
                      {!mapsLoaded[activeDate] && (
                        <div className="map-loading-overlay">
                          <div className="map-loading-spinner"></div>
                          <p>{t("curation.loadingMap", "Loading map...")}</p>
                        </div>
                      )}
                      <ItineraryMap
                        daySpots={itinerary[activeDate]}
                        date={formatDisplayDate(activeDate)}
                        onMapLoaded={() => handleMapLoaded(activeDate)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-day-message">
                  {t("curation.freeDay", "Free day - No activities planned")}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 토스트 메시지 컨테이너 */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryModal; 