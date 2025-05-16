import React, { useState, useCallback } from "react";
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

const url = process.env.REACT_APP_WAS_URL;

// const fetchNaverPlaces = async (query) => {
//   if (!query) return [];
//   try {
//     const res = await axios.get(
//       `${url}/api/naver/search?query=${encodeURIComponent(query)}`
//     );
//     return res.data.places || [];
//   } catch (error) {
//     console.error("Error fetching Naver places:", error);
//     return [];
//   }
// };

// const fetchKakaoPlaces = async (query) => {
//   if (!query) return [];

//   try {
//     const res = await axios.get(
//       `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
//         query
//       )}`,
//       {
//         headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
//       }
//     );

//     console.log("Kakao response:", res.data);
//     return res.data.documents || [];
//   } catch (error) {
//     console.error("Error fetching Kakao places:", error);
//     return [];
//   }
// };

const SpotInput = ({ value, onChange }) => {
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

  const debouncedFetch = useCallback(
    debounce((q) => fetchSuggestions(q), 500),
    []
  );

  // const getBrowserLangCode = () => {
  //   const lang = navigator.language || navigator.userLanguage; // 예: 'ja-JP'
  //   return lang.split("-")[0]; // 'ja', 'en', 'ko' 등
  // };

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

  const fetchSuggestions = async (val) => {
    if (val.length > 1) {
      const results = await fetchGooglePlaces(val);
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
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
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

const Curation = () => {
  const [spots, setSpots] = useState([{ name: "" }]); // Initialize with a placeholder object
  const [itinerary, setItinerary] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { theme } = useTheme();

  const handleSpotChange = (idx, value) => {
    const newSpots = [...spots];
    newSpots[idx] = value || { name: "" }; // If value is null, reset to empty object with name property
    setSpots(newSpots);

    // 모든 장소가 비어있는지 확인
    const allEmpty = newSpots.every(
      (spot) => !spot.name || spot.name.trim() === ""
    );

    // 모든 장소가 비어있으면 알림 표시
    if (allEmpty && newSpots.length > 1) {
      const message = t(
        "curation.allSpotsEmpty",
        "모든 장소가 비어 있습니다. 리셋하시겠습니까?"
      );
      setAlertMessage(message);
      setShowAlert(true);

      // 3초 후 알림 숨기기
      setTimeout(() => {
        setShowAlert(false);
        // 자동으로 리셋
        setSpots([{ name: "" }]);
      }, 3000);
    }
  };

  const addSpot = () => {
    const max = 5;
    // 스팟이 10개를 초과하는지 확인
    if (spots.length >= max) {
      // toast 대신 상태를 이용한 알림 표시
      const message = t(
        "curation.maxSpotsReached",
        `최대 ${max}개의 장소만 추가할 수 있습니다.`,
        { max: max }
      );
      setAlertMessage(message);
      setShowAlert(true);

      // 3초 후 알림 숨기기
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return;
    }
    setSpots([...spots, { name: "" }]);
  };

  // 모든 스팟을 초기화하는 함수 추가
  const resetSpot = () => {
    setSpots([{ name: "" }]);

    // 초기화 알림 표시
    const message = t("curation.spotsReset", "모든 장소가 초기화되었습니다.");
    setAlertMessage(message);
    setShowAlert(true);

    // 3초 후 알림 숨기기
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const generateItinerary = async () => {
    // 실제 구현에서는 AI/백엔드 호출
    // setItinerary({
    //   date:
    //     startDate && endDate
    //       ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    //       : "Friday, April 25",
    //   start: spots[0].name,
    //   route: [
    //     { name: "Seongsu-dong Café", time: "9:00 AM - 10:30 AM", icon: "cafe" },
    //     {
    //       name: "Bukchon Hanok Village",
    //       time: "10:30 AM - 12:00 PM",
    //       icon: "hanok",
    //     },
    //     { name: "COEX", time: "12:30 PM - 2:00 PM", icon: "mall" },
    //   ],
    // });
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Spots with full information:", spots);
    const response = await axios.post(`${url}/api/curation/generate`, {
      startDate,
      endDate,
      spots,
    });
    console.log("Response:", response.data);
  };

  // DatePicker 다크 모드용 클래스 생성
  const datePickerClassName = `custom-datepicker ${
    theme === "dark" ? "dark-theme-datepicker" : ""
  }`;

  return (
    <div className="curation-container">
      <h1>{t("curation.title", "Curation")}</h1>
      <p>
        {t(
          "curation.subtitle",
          "Enter must-visit spots and get your full itinerary!"
        )}
      </p>

      <div className="direction-image-container">
        <img
          src={directionImg}
          alt="Travel direction"
          className="direction-image"
        />
      </div>

      {/* 커스텀 알림 표시 */}
      {showAlert && <div className="custom-alert">{alertMessage}</div>}

      <div className="date-range-inputs">
        <div
          style={{
            justifyContent: "space-between !important",
          }}
        >
          <label>Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(formatDate(date))}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            className={datePickerClassName}
          />
        </div>
        <div>
          <label>End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(formatDate(date))}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            className={datePickerClassName}
          />
        </div>
      </div>
      <div className="spot-inputs">
        {spots.map((spot, idx) => (
          <SpotInput
            key={idx}
            value={spot}
            onChange={(val) => handleSpotChange(idx, val)}
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
      <button className="generate-btn" onClick={generateItinerary}>
        {t("curation.generateItinerary", "Generate Itinerary")}
      </button>

      {itinerary && (
        <div className="itinerary-card">
          <h2>Suggested Itinerary</h2>
          <div className="itinerary-date">{itinerary.date}</div>
          <div className="itinerary-start">Start at {itinerary.start}</div>
          <div className="itinerary-map">
            {/* 지도 컴포넌트 자리 (예: <ItineraryMap ... />) */}
            <img src="/mock-map.png" alt="map" className="mock-map" />
          </div>
          <div className="itinerary-list">
            {itinerary.route.map((item, idx) => (
              <div className="itinerary-spot" key={idx}>
                <span className={`icon icon-${item.icon}`} />
                <div>
                  <div className="spot-name">{item.name}</div>
                  <div className="spot-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Curation;
