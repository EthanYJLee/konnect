import React, { useState, useCallback, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Curation.scss";
import debounce from "lodash.debounce";
import axios from "axios";
import { useTranslation } from "react-i18next";
import directionImg from "../assets/images/direction_img.png";
import { useTheme } from "../contexts/ThemeContext";
import { useRateLimit } from "../contexts/RateLimitContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import SimpleItineraryMap from "../components/SimpleItineraryMap";

// 컴포넌트 임포트
import SpotInput from "../components/SpotInput";
import CitySelector from "../components/CitySelector";
import ItineraryModal from "../components/ItineraryModal";
import Toast from "../components/Toast";

const url = process.env.REACT_APP_WAS_URL;

const Curation = () => {
  const {
    checkSearchLimit,
    checkItineraryLimit,
    getRemainingRequests,
    getTimeToReset,
  } = useRateLimit();
  const [spots, setSpots] = useState([{ id: 1, name: "" }]);
  const [itinerary, setItinerary] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [departureCity, setDepartureCity] = useState(null);
  const [arrivalCity, setArrivalCity] = useState(null);
  const { t, i18n } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { theme } = useTheme();
  const [showCategorySelector, setShowCategorySelector] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [nextId, setNextId] = useState(2);
  const [loading, setLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  // 모달 상태 추가
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  // 토스트 관련 상태
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // 스크롤 위치 감지
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };

    // 사용자 국적, 성별, 나이 정보 유무 확인
  }, []);

  // 언어 변경 감지 및 선택된 카테고리 업데이트
  useEffect(() => {
    if (selectedCategories.length > 0) {
      // 카테고리 정의 가져오기
      const updatedCategories = [
        {
          id: "12",
          icon: "🏯",
          name: t("curation.categories.attraction", "관광지"),
        },
        {
          id: "14",
          icon: "🏛️",
          name: t("curation.categories.culture", "문화시설"),
        },
        {
          id: "15",
          icon: "🎭",
          name: t("curation.categories.festival", "축제공연행사"),
        },
        {
          id: "25",
          icon: "🧭",
          name: t("curation.categories.tourCourse", "여행코스"),
        },
        {
          id: "28",
          icon: "🚵",
          name: t("curation.categories.leisure", "레포츠"),
        },
        {
          id: "32",
          icon: "🏨",
          name: t("curation.categories.accommodation", "숙박"),
        },
        {
          id: "38",
          icon: "🛍️",
          name: t("curation.categories.shopping", "쇼핑"),
        },
        {
          id: "39",
          icon: "🍽️",
          name: t("curation.categories.food", "음식점"),
        },
      ];

      // 선택된 카테고리 업데이트
      const updatedSelectedCategories = selectedCategories.map(
        (selectedCat) => {
          const updatedCat = updatedCategories.find(
            (cat) => cat.id === selectedCat.id
          );
          return updatedCat || selectedCat;
        }
      );

      setSelectedCategories(updatedSelectedCategories);
    }
  }, [t, i18n.language]);

  // 토스트 메시지 표시 함수
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  // 토스트 메시지 제거 함수
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Available trip categories
  const categories = [
    {
      id: "12",
      icon: "🏯",
      name: t("curation.categories.attraction", "관광지"),
    },
    {
      id: "14",
      icon: "🏛️",
      name: t("curation.categories.culture", "문화시설"),
    },
    {
      id: "15",
      icon: "🎭",
      name: t("curation.categories.festival", "축제공연행사"),
    },
    {
      id: "25",
      icon: "🧭",
      name: t("curation.categories.tourCourse", "여행코스"),
    },
    {
      id: "28",
      icon: "🚵",
      name: t("curation.categories.leisure", "레포츠"),
    },
    {
      id: "32",
      icon: "🏨",
      name: t("curation.categories.accommodation", "숙박"),
    },
    {
      id: "38",
      icon: "🛍️",
      name: t("curation.categories.shopping", "쇼핑"),
    },
    {
      id: "39",
      icon: "🍽️",
      name: t("curation.categories.food", "음식점"),
    },
  ];

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prevCategories) => {
      const isSelected = prevCategories.some((cat) => cat.id === category.id);

      if (isSelected) {
        return prevCategories.filter((cat) => cat.id !== category.id);
      } else {
        return [...prevCategories, category];
      }
    });
  };

  const handleCategoryConfirm = () => {
    if (selectedCategories.length > 0) {
      setShowCategorySelector(false);
    } else {
      showToast(
        t("curation.selectAtLeastOne", "Please select at least one category"),
        "warning"
      );
    }
  };

  const handleSpotChange = (idx, value) => {
    setSpots((prevSpots) => {
      const newSpots = [...prevSpots];
      const id = newSpots[idx].id;
      newSpots[idx] = value ? { ...value, id } : { id, name: "" };

      const allEmpty = newSpots.every(
        (spot) => !spot.name || spot.name.trim() === ""
      );
      if (allEmpty && newSpots.length > 1) {
        showToast(
          t(
            "curation.allSpotsEmpty",
            "모든 장소가 비어 있습니다. 자동으로 초기화합니다."
          ),
          "info"
        );

        setTimeout(() => {
          setSpots([{ id: 1, name: "" }]);
          setNextId(2);
        }, 3000);
      }

      return newSpots;
    });
  };

  const addSpot = () => {
    const max = 5;
    if (spots.length >= max) {
      showToast(
        t(
          "curation.maxSpotsReached",
          `최대 ${max}개의 장소만 추가할 수 있습니다.`,
          { max: max }
        ),
        "warning"
      );
      return;
    }

    setSpots((prevSpots) => [...prevSpots, { id: nextId, name: "" }]);
    setNextId((prevId) => prevId + 1);
  };

  const resetSpot = () => {
    setSpots([{ id: 1, name: "" }]);
    setNextId(2);

    showToast(
      t("curation.spotsReset", "모든 장소가 초기화되었습니다."),
      "info"
    );
  };

  const formatDate = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 입력 검증 함수
  const validateInputs = () => {
    if (!startDate) {
      showToast(t("curation.validation.startDateRequired"), "warning");
      return false;
    }

    if (!endDate) {
      showToast(t("curation.validation.endDateRequired"), "warning");
      return false;
    }

    if (!departureCity) {
      showToast(t("curation.validation.departureCityRequired"), "warning");
      return false;
    }

    if (!arrivalCity) {
      showToast(t("curation.validation.arrivalCityRequired"), "warning");
      return false;
    }

    // 최소 하나의 유효한 spot이 있는지 확인
    const validSpots = spots.filter(
      (spot) => spot.name && spot.name.trim() !== ""
    );
    if (validSpots.length === 0) {
      showToast(t("curation.validation.noSpotsEntered"), "warning");
      return false;
    }

    return true;
  };

  const generateItinerary = async () => {
    // 입력 검증
    if (!validateInputs()) {
      return;
    }

    // 일정 생성 요청 제한 확인
    if (!checkItineraryLimit()) {
      showToast(
        t(
          "curation.rateLimitExceeded",
          "일정 생성 한도에 도달했습니다. {{minutes}}분 후에 다시 시도해주세요.",
          { minutes: getTimeToReset("itinerary") }
        ),
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);
      console.log("Departure City:", departureCity);
      console.log("Arrival City:", arrivalCity);
      console.log("Spots with full information:", spots);
      console.log("Selected Categories:", selectedCategories);

      const selectedLanguage = localStorage.getItem("language") || "en";
      console.log("Selected Language:", selectedLanguage);

      const categoryCodes = selectedCategories.map((cat) => cat.id);
      console.log("Category Codes:", categoryCodes);

      const response = await axios.post(`${url}/api/curation/generate`, {
        startDate: startDate ? formatDate(startDate) : null,
        endDate: endDate ? formatDate(endDate) : null,
        departureCity,
        arrivalCity,
        spots,
        categories: categoryCodes,
        language: selectedLanguage, // Header의 LanguageSelector에서 설정한 언어
      });

      console.log("Response:", response.data);
      setItinerary(response.data.itinerary.schedule);

      // 일정이 생성되면 모달 표시
      setShowItineraryModal(true);

      // 성공 메시지 표시
      showToast(
        t(
          "curation.itineraryGenerated",
          "Your itinerary has been successfully generated!"
        ),
        "success"
      );
    } catch (error) {
      console.error("Error generating itinerary:", error);
      showToast(
        t(
          "curation.generationError",
          "Failed to generate itinerary. Please try again."
        ),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // 날짜 객체로 변환하는 함수
  const parseDate = (dateString) => {
    const [year, month, day] = dateString
      .split("-")
      .map((num) => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  // 날짜를 사용자 친화적으로 표시하는 함수
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";

    const date = parseDate(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(t("curation.language", "en"), options);
  };

  const removeSpot = (indexToRemove) => {
    if (spots.length > 1) {
      setSpots((prevSpots) => {
        return prevSpots.filter((_, index) => index !== indexToRemove);
      });
    }
  };

  return (
    <div className="curation-container">
      <h1>{t("curation.title", "Curation")}</h1>
      <p>
        {t(
          "curation.subtitle",
          "Enter must-visit spots and get your full itinerary!"
        )}
      </p>

      {/* 남은 요청 수 표시 */}
      <div className="rate-limit-info">
        <small>
          {t(
            "curation.remainingItineraries",
            "남은 일정 생성: {{count}}/{{total}}",
            {
              count: getRemainingRequests("itinerary"),
              total: 5,
            }
          )}
        </small>
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

      {/* 일정 모달 */}
      <ItineraryModal
        isOpen={showItineraryModal}
        onClose={() => setShowItineraryModal(false)}
        itinerary={itinerary || {}}
        formatDisplayDate={formatDisplayDate}
      />

      {showCategorySelector ? (
        <div className="category-selector-container">
          <h2>{t("curation.selectCategory", "Select Trip Category")}</h2>
          <p>
            {t(
              "curation.categoryMultipleDescription",
              "What types of activities are you interested in? (Select all that apply)"
            )}
          </p>

          <div className="category-grid">
            {categories.map((category) => {
              const isSelected = selectedCategories.some(
                (cat) => cat.id === category.id
              );
              return (
                <div
                  key={category.id}
                  className={`category-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-name">{category.name}</div>
                  {isSelected && <div className="selected-indicator">✓</div>}
                </div>
              );
            })}
          </div>

          <button
            className="category-confirm-btn"
            onClick={handleCategoryConfirm}
          >
            {t("curation.confirmCategories", "Continue")}
          </button>
        </div>
      ) : (
        <>
          <div className="selected-categories">
            <div className="categories-list">
              {selectedCategories.map((category, index) => (
                <span key={category.id} className="category-tag">
                  {category.icon} {category.name}
                </span>
              ))}
            </div>
            <button
              className="change-category-btn"
              onClick={() => setShowCategorySelector(true)}
            >
              {t("curation.changeCategory", "Change")}
            </button>
          </div>

          <div className="direction-image-container">
            <div className="direction-text-overlay">
              <div className="direction-image-wrapper">
                <img
                  src={directionImg}
                  alt="Travel direction"
                  className="direction-image"
                />
              </div>
              <div className="direction-content">
                <div className="direction-upper-content">
                  <div className="direction-image-wrapper mobile-only">
                    <img
                      src={directionImg}
                      alt="Travel direction"
                      className="direction-image"
                    />
                  </div>
                  <div className="direction-from-to">
                    <div className="direction-location-wrapper">
                      <div className="direction-from">
                        <span className="location-icon">🛫</span>
                        <CitySelector
                          value={departureCity}
                          onChange={setDepartureCity}
                          placeholder={t("curation.selectCity", "Select city")}
                          customClass="direction-city-select"
                        />
                      </div>
                    </div>
                    <span className="direction-arrow">→</span>
                    <div className="direction-location-wrapper">
                      <div className="direction-to">
                        <span className="location-icon">🏁</span>
                        <CitySelector
                          value={arrivalCity}
                          onChange={setArrivalCity}
                          placeholder={t("curation.selectCity", "Select city")}
                          customClass="direction-city-select"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="direction-dates">
                  <span className="date-icon">📅</span>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="yyyy-MM-dd"
                      placeholderText={t(
                        "curation.selectStartDate",
                        "Select start date"
                      )}
                      className="direction-date-picker"
                      popperPlacement="bottom"
                      withPortal
                      portalId="date-picker-portal"
                      popperModifiers={[
                        {
                          name: "offset",
                          options: {
                            offset: [0, 10],
                          },
                        },
                        {
                          name: "preventOverflow",
                          options: {
                            rootBoundary: "viewport",
                            padding: 8,
                          },
                        },
                      ]}
                      popperClassName="date-picker-popper"
                    />
                    <span className="date-separator">~</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="yyyy-MM-dd"
                      placeholderText={t(
                        "curation.selectEndDate",
                        "Select end date"
                      )}
                      className="direction-date-picker"
                      popperPlacement="bottom"
                      withPortal
                      portalId="date-picker-portal"
                      popperModifiers={[
                        {
                          name: "offset",
                          options: {
                            offset: [0, 10],
                          },
                        },
                        {
                          name: "preventOverflow",
                          options: {
                            rootBoundary: "viewport",
                            padding: 8,
                          },
                        },
                      ]}
                      popperClassName="date-picker-popper"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showAlert && <div className="custom-alert">{alertMessage}</div>}

          <div className="spot-inputs">
            {spots.map((spot, idx) => (
              <SpotInput
                key={spot.id}
                value={spot}
                onChange={(val) => handleSpotChange(idx, val)}
                onRemove={() => removeSpot(idx)}
                showRemoveButton={spots.length > 1}
              />
            ))}
            <div className="spot-button-group">
              <button onClick={addSpot} className="add-spot-btn">
                + {t("curation.addSpot", "Add Spot")}
              </button>
              <button onClick={resetSpot} className="reset-spot-btn">
                {t("curation.resetSpot", "Reset All")}
              </button>
            </div>
          </div>

          <button
            className={`generate-btn ${loading ? "loading" : ""}`}
            onClick={generateItinerary}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              t("curation.generateItinerary", "Generate Itinerary")
            )}
          </button>

          {/* 기존 itinerary 표시 부분 제거 - 모달로 대체 */}
          {itinerary && (
            <div className="view-itinerary-button-container">
              <button
                className="view-itinerary-button"
                onClick={() => setShowItineraryModal(true)}
              >
                {t("curation.viewCurationItinerary", "View Your Itinerary")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Curation;
