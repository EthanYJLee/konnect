import React, { useState, useCallback, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Curation.scss";
import debounce from "lodash.debounce";
import axios from "axios";
import { useTranslation } from "react-i18next";
import directionImg from "../assets/images/direction_img.png";
import { useTheme } from "../contexts/ThemeContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import ItineraryMap from "../components/ItineraryMap";
import SimpleItineraryMap from "../components/SimpleItineraryMap";

const url = process.env.REACT_APP_WAS_URL;

// 한국의 주요 도시 목록 (다국어 지원)
const koreanCities = {
  seoul: {
    ko: "서울",
    en: "Seoul",
    ja: "ソウル",
    zh: "首尔",
    vi: "Seoul",
  },
  busan: {
    ko: "부산",
    en: "Busan",
    ja: "釜山",
    zh: "釜山",
    vi: "Busan",
  },
  incheon: {
    ko: "인천",
    en: "Incheon",
    ja: "仁川",
    zh: "仁川",
    vi: "Incheon",
  },
  jeju: {
    ko: "제주",
    en: "Jeju",
    ja: "済州",
    zh: "济州",
    vi: "Jeju",
  },
  daegu: {
    ko: "대구",
    en: "Daegu",
    ja: "大邱",
    zh: "大邱",
    vi: "Daegu",
  },
  daejeon: {
    ko: "대전",
    en: "Daejeon",
    ja: "大田",
    zh: "大田",
    vi: "Daejeon",
  },
  gwangju: {
    ko: "광주",
    en: "Gwangju",
    ja: "光州",
    zh: "光州",
    vi: "Gwangju",
  },
  suwon: {
    ko: "수원",
    en: "Suwon",
    ja: "水原",
    zh: "水原",
    vi: "Suwon",
  },
  ulsan: {
    ko: "울산",
    en: "Ulsan",
    ja: "蔚山",
    zh: "蔚山",
    vi: "Ulsan",
  },
  gangneung: {
    ko: "강릉",
    en: "Gangneung",
    ja: "江陵",
    zh: "江陵",
    vi: "Gangneung",
  },
};

const SpotInput = ({ value, onChange, onRemove, showRemoveButton }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showClearButton, setShowClearButton] = useState(!!value?.name);
  const { t } = useTranslation();

  const handleInput = async (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowClearButton(!!val);
    debouncedFetch(val);
  };

  const handleClear = () => {
    setInputValue("");
    setShowClearButton(false);
    onChange(null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  const debouncedFetch = useCallback(
    debounce((q) => fetchSuggestions(q), 500),
    []
  );

  const fetchGooglePlaces = async (query) => {
    if (!query) return [];
    // const lang = getBrowserLangCode();
    try {
      const res = await axios.get(`${url}/api/google/search`, {
        params: { query, lang: t("curation.language") },
        // params: { query, lang: lang },
      });
      return res.data.results || [];
    } catch (error) {
      console.error("Error fetching Google places from backend:", error);
      return [];
    }
  };

  const fetchNominatimPlaces = async (query) => {
    if (!query) return [];
    try {
      const res = await axios.get(`${url}/api/nominatim/search`, {
        params: { query, lang: t("curation.language") },
      });
      console.log(res.data);
      return res.data.results || [];
    } catch (error) {
      console.error("Error fetching Nominatim places:", error);
      return [];
    }
  };

  const fetchSuggestions = async (val) => {
    if (val.length > 1) {
      const results = await fetchGooglePlaces(val);
      // const results = await fetchNominatimPlaces(val);
      setSuggestions(results);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (place) => {
    setInputValue(place.name);
    setShowDropdown(false);
    setShowClearButton(true);
    onChange(place); // Pass the entire place object instead of just the name
  };

  return (
    <div style={{ position: "relative" }} className="spot-input-container">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInput}
            placeholder={t(
              "curation.spotPlaceholder",
              "장소를 입력하세요 (예: 카페, 명소 등)"
            )}
            autoComplete="off"
            className="spot-autocomplete-input"
            onFocus={() => inputValue.length > 1 && setShowDropdown(true)}
            onBlur={(e) => {
              // 클릭된 요소가 삭제 버튼이 아닐 때만 드롭다운을 닫음
              const clickedElement = e.relatedTarget;
              if (
                !clickedElement ||
                !clickedElement.classList.contains("remove-spot-btn")
              ) {
                setTimeout(() => setShowDropdown(false), 150);
              }
            }}
          />
          {showClearButton && (
            <button
              type="button"
              className="clear-input-button"
              onClick={handleClear}
              aria-label={t("curation.clearInput", "입력 지우기")}
            >
              ×
            </button>
          )}
        </div>
        {showRemoveButton && (
          <button
            type="button"
            onClick={handleRemove}
            className="remove-spot-btn"
            aria-label={t("curation.removeSpot", "스팟 삭제")}
          >
            🗑️
          </button>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="spot-suggestion-dropdown">
          {suggestions.map((place) => (
            <li key={place.id} onClick={() => handleSelect(place)}>
              <span>{place.name}</span>
              <span style={{ color: "#888", fontSize: "0.9em", marginLeft: 6 }}>
                {place.formatted_address}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CitySelector = ({ value, onChange, label, placeholder }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] || "en"; // 현재 언어 코드 (en, ko, ja, zh, vi 등)

  // 선택된 도시 이름 (현재 언어로)
  const selectedCityName = value
    ? koreanCities[value][currentLang] || koreanCities[value].en
    : "";

  return (
    <div className="city-selector">
      <label>{label}</label>
      <div className="select-wrapper">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="city-select"
        >
          <option value="">{placeholder}</option>
          {Object.keys(koreanCities).map((cityKey) => (
            <option key={cityKey} value={cityKey}>
              {koreanCities[cityKey][currentLang] || koreanCities[cityKey].en}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// 토스트 메시지 컴포넌트
const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 페이드아웃 애니메이션 후 제거
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastClass = () => {
    let baseClass = `custom-toast ${isVisible ? "show" : "hide"}`;

    switch (type) {
      case "warning":
        return `${baseClass} toast-warning`;
      case "error":
        return `${baseClass} toast-error`;
      case "success":
        return `${baseClass} toast-success`;
      default:
        return `${baseClass} toast-info`;
    }
  };

  return (
    <div className={getToastClass()}>
      <div className="toast-content">
        <span>{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        ×
      </button>
    </div>
  );
};

const Curation = () => {
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

  // 토스트 관련 상태
  const [toasts, setToasts] = useState([]);

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 언어 변경 감지 및 선택된 카테고리 업데이트
  useEffect(() => {
    if (selectedCategories.length > 0) {
      // 카테고리 정의 가져오기
      const updatedCategories = [
        {
          id: "A01",
          icon: "🌳",
          name: t("curation.categories.nature", "자연"),
        },
        {
          id: "A02",
          icon: "🏛️",
          name: t("curation.categories.humanities", "인문(문화/예술/역사)"),
        },
        {
          id: "A03",
          icon: "🚵",
          name: t("curation.categories.leisure", "레포츠"),
        },
        {
          id: "A04",
          icon: "🛍️",
          name: t("curation.categories.shopping", "쇼핑"),
        },
        { id: "A05", icon: "🍽️", name: t("curation.categories.food", "음식") },
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
    { id: "A01", icon: "🌳", name: t("curation.categories.nature", "자연") },
    {
      id: "A02",
      icon: "🏛️",
      name: t("curation.categories.humanities", "인문(문화/예술/역사)"),
    },
    { id: "A03", icon: "🚵", name: t("curation.categories.leisure", "레포츠") },
    { id: "A04", icon: "🛍️", name: t("curation.categories.shopping", "쇼핑") },
    { id: "A05", icon: "🍽️", name: t("curation.categories.food", "음식") },
  ];

  // Toggle a category in the selection
  const handleCategoryToggle = (category) => {
    setSelectedCategories((prevCategories) => {
      // Check if this category is already selected
      const isSelected = prevCategories.some((cat) => cat.id === category.id);

      if (isSelected) {
        // Remove from selected categories
        return prevCategories.filter((cat) => cat.id !== category.id);
      } else {
        // Add to selected categories
        return [...prevCategories, category];
      }
    });
  };

  // Proceed to the main curation interface
  const handleCategoryConfirm = () => {
    if (selectedCategories.length > 0) {
      setShowCategorySelector(false);
    } else {
      // Show warning toast if no category is selected
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

    try {
      setLoading(true);

      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);
      console.log("Departure City:", departureCity);
      console.log("Arrival City:", arrivalCity);
      console.log("Spots with full information:", spots);
      console.log("Selected Categories:", selectedCategories);

      // Header에서 설정된 언어 가져오기 (localStorage에서 직접 가져옴)
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

      // 자동으로 결과로 스크롤
      setTimeout(() => {
        const resultsElement = document.getElementById("itinerary-results");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
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

  // DatePicker 다크 모드용 클래스 생성
  const datePickerClassName = `custom-datepicker ${
    theme === "dark" ? "dark-theme-datepicker" : ""
  }`;

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

      {/* 커스텀 토스트 메시지 컨테이너 */}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 10000,
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

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
            <img
              src={directionImg}
              alt="Travel direction"
              className="direction-image"
            />
          </div>

          {showAlert && <div className="custom-alert">{alertMessage}</div>}

          <div className="city-date-container">
            <div className="date-range-inputs">
              <div
                style={{
                  justifyContent: "space-between !important",
                }}
              >
                <label>{t("curation.startDate", "Start Date")}</label>
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
                  className={datePickerClassName}
                />
              </div>
              <div>
                <label>{t("curation.endDate", "End Date")}</label>
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
                  className={datePickerClassName}
                />
              </div>
            </div>
          </div>
          <div className="cities-container">
            <CitySelector
              value={departureCity}
              onChange={setDepartureCity}
              label={t("curation.departureCity", "Departure City")}
              placeholder={t("curation.selectCity", "Select city")}
            />
            <CitySelector
              value={arrivalCity}
              onChange={setArrivalCity}
              label={t("curation.arrivalCity", "Arrival City")}
              placeholder={t("curation.selectCity", "Select city")}
            />
          </div>

          <div style={{ height: "1rem" }} />
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

          {itinerary && (
            <div className="itinerary-results" id="itinerary-results">
              <h2>{t("curation.itineraryResults", "Your Travel Itinerary")}</h2>

              {Object.keys(itinerary)
                .sort()
                .map((date) => (
                  <div key={date} className="itinerary-day-card">
                    <div className="itinerary-date">
                      {formatDisplayDate(date)}
                    </div>

                    {itinerary[date].length > 0 ? (
                      <>
                        <div className="day-spots-container">
                          {itinerary[date].map((spot, index) => (
                            <div
                              key={`${date}-${index}`}
                              className="itinerary-spot"
                            >
                              <div className="spot-number">{index + 1}</div>
                              <div className="spot-details">
                                <div className="spot-name">{spot.spot}</div>
                                <div className="spot-location">
                                  {spot.city}{" "}
                                  {spot.district && `• ${spot.district}`}{" "}
                                  {spot.neighborhood &&
                                    `• ${spot.neighborhood}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="day-map-container">
                          <ItineraryMap
                            daySpots={itinerary[date]}
                            date={formatDisplayDate(date)}
                          />
                        </div>
                        {/* <div className="day-map-container">
                          <SimpleItineraryMap
                            daySpots={itinerary[date]}
                            date={formatDisplayDate(date)}
                          />
                        </div> */}
                      </>
                    ) : (
                      <div className="empty-day-message">
                        {t(
                          "curation.freeDay",
                          "Free day - No activities planned"
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Curation;
