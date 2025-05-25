import React, { useRef, useState, useEffect } from "react";
import "../styles/HistoryItineraryModal.scss";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Toast from "./Toast";

// Leaflet의 마커 아이콘 문제 해결
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 커스텀 마커 아이콘 생성 함수
const createCustomIcon = (index) => {
  // 기본 색상 설정
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#5B9BD5', '#3F51B5'];
  const color = colors[index % colors.length];
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const HistoryItineraryModal = ({ isOpen, onClose, itinerary, formatDisplayDate }) => {
  const modalRef = useRef(null);
  const [animateOut, setAnimateOut] = useState(false);
  const [activeDate, setActiveDate] = useState(null);
  const [sortedDates, setSortedDates] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [toasts, setToasts] = useState([]);
  const { t } = useTranslation();
  const { theme } = useTheme();

  // 컴포넌트 초기화
  useEffect(() => {
    if (!isOpen || !itinerary) return;
    
    try {
      // 데이터 검증
      if (typeof itinerary !== 'object' || !itinerary) {
        setHasError(true);
        return;
      }
      
      // 날짜 정렬
      const dates = Object.keys(itinerary).sort();
      setSortedDates(dates);
      
      // 첫 번째 날짜를 기본으로 선택
      if (dates.length > 0 && !activeDate) {
        setActiveDate(dates[0]);
      }
    } catch (error) {
      console.error("Error in HistoryItineraryModal initialization:", error);
      setHasError(true);
    }
  }, [isOpen, itinerary]);
  
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
    try {
      setAnimateOut(true);
      setTimeout(() => {
        setAnimateOut(false);
        onClose();
      }, 300);
    } catch (error) {
      console.error("Error in handleClose:", error);
      onClose();
    }
  };

  // 토스트 메시지 표시 함수
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  // 토스트 메시지 제거 함수
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // 날짜 탭 클릭 핸들러
  const handleDateClick = (date) => {
    setActiveDate(date);
  };

  // 스팟 번호에 사용할 그라데이션 색상 생성
  const getSpotColor = (index, total) => {
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
  
  // 이벤트 리스너 설정
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
  
  // 에러 발생 시 대체 UI 표시
  if (hasError || !itinerary || typeof itinerary !== 'object') {
    return (
      <div className="itinerary-modal-overlay" style={{ opacity: 1, zIndex: 99999 }}>
        <div className="itinerary-modal-container" ref={modalRef} style={{ opacity: 1, transform: 'none' }}>
          <div className="itinerary-modal-header">
            <h2>{t("curation.error", "Error")}</h2>
            <button className="itinerary-modal-close" onClick={handleClose}>
              ⓧ
            </button>
          </div>
          <div className="itinerary-modal-content">
            <div className="error-message">
              {t("curation.itineraryError", "There was an error loading this itinerary. Please try again later.")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 스타일에 직접 opacity와 transform을 지정하여 애니메이션 문제 해결
  const overlayStyle = {
    opacity: 1,
    zIndex: 99999
  };
  
  const containerStyle = {
    opacity: 1,
    transform: 'none'
  };

  const modalClasses = `itinerary-modal-overlay ${
    animateOut ? "animate-out" : ""
  } ${theme === "dark" ? "dark-theme" : ""}`;
  
  const containerClasses = `itinerary-modal-container ${
    animateOut ? "animate-out" : ""
  }`;

  // 모달에 표시할 유효한 스팟 필터링
  const getValidSpots = (spots) => {
    if (!spots || !Array.isArray(spots)) return [];
    
    return spots.filter(spot => 
      spot && 
      spot.lat && spot.lng && 
      !isNaN(parseFloat(spot.lat)) && 
      !isNaN(parseFloat(spot.lng))
    );
  };

  // 지도 중심점 계산
  const getMapCenter = (spots) => {
    const validSpots = getValidSpots(spots);
    if (validSpots.length === 0) return [37.5665, 126.9780]; // 서울 기본 좌표
    
    return [parseFloat(validSpots[0].lat), parseFloat(validSpots[0].lng)];
  };

  return (
    <div className={modalClasses} style={overlayStyle}>
      <div className={containerClasses} ref={modalRef} style={containerStyle}>
        <div className="itinerary-modal-header">
          <h2>{t("history.viewItinerary", "View Itinerary")}</h2>
          <button className="itinerary-modal-close" onClick={handleClose}>
            ⓧ
          </button>
        </div>
        
        {sortedDates.length > 0 && (
          <div className="itinerary-date-tabs">
            {sortedDates.map((date) => (
              <button
                key={`tab-${date}`}
                className={`date-tab ${activeDate === date ? "active" : ""}`}
                onClick={() => handleDateClick(date)}
              >
                <span className="tab-date">{formatDisplayDate ? formatDisplayDate(date) : date}</span>
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
              <div className="itinerary-date">{formatDisplayDate ? formatDisplayDate(activeDate) : activeDate}</div>

              {itinerary[activeDate]?.length > 0 ? (
                <>
                  <div className="itinerary-content-container">
                    <div className="day-spots-container">
                      {itinerary[activeDate].map((spot, index) => (
                        <div
                          key={`${activeDate}-${index}`}
                          className="itinerary-spot"
                          style={{ 
                            animationDelay: `${index * 0.1}s`,
                            opacity: 1,
                            transform: 'none'
                          }}
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
                      {/* 간소화된 지도 컴포넌트 직접 구현 */}
                      <div className="itinerary-map-container">
                        <MapContainer 
                          center={getMapCenter(itinerary[activeDate])} 
                          zoom={13} 
                          style={{ height: '400px', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          
                          {getValidSpots(itinerary[activeDate]).map((spot, index) => {
                            const lat = parseFloat(spot.lat);
                            const lng = parseFloat(spot.lng);
                            
                            if (isNaN(lat) || isNaN(lng)) return null;
                            
                            return (
                              <Marker 
                                key={`marker-${index}`} 
                                position={[lat, lng]}
                                icon={createCustomIcon(index)}
                              >
                                <Popup>
                                  <div className="spot-popup">
                                    <strong>{index + 1}. {spot.spot}</strong>
                                    <div>{spot.city} {spot.district || ''} {spot.neighborhood || ''}</div>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          })}
                        </MapContainer>
                      </div>
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

export default HistoryItineraryModal; 