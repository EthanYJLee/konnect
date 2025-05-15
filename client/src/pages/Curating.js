import React, { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Curating.scss";
import debounce from "lodash.debounce";
import axios from "axios";

// const KAKAO_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
const KAKAO_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY_TEST;

// const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
// const NAVER_CLIENT_SECRET = process.env.REACT_APP_NAVER_CLIENT_SECRET;
const url = process.env.REACT_APP_WAS_URL;

const fetchNaverPlaces = async (query) => {
  if (!query) return [];
  try {
    const res = await axios.get(
      `${url}/api/naver/search?query=${encodeURIComponent(query)}`
    );
    return res.data.places || [];
  } catch (error) {
    console.error("Error fetching Naver places:", error);
    return [];
  }
};

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
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInput = async (e) => {
    const val = e.target.value;
    setInputValue(val);
    debouncedFetch(val);
  };

  const debouncedFetch = useCallback(
    debounce((q) => fetchSuggestions(q), 500),
    []
  );

  const fetchSuggestions = async (val) => {
    if (val.length > 1) {
      const results = await fetchNaverPlaces(val);
      console.log(results);
      setSuggestions(results);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };
  // const fetchSuggestions = async (val) => {
  //   if (val.length > 1) {
  //     const results = await fetchKakaoPlaces(val);
  //     setSuggestions(results);
  //     setShowDropdown(true);
  //   } else {
  //     setSuggestions([]);
  //     setShowDropdown(false);
  //   }
  // };

  const handleSelect = (place) => {
    setInputValue(place.name);
    setShowDropdown(false);
    onChange(place.name);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInput}
        placeholder="장소를 입력하세요 (예: 카페, 명소 등)"
        autoComplete="off"
        className="spot-autocomplete-input"
        onFocus={() => inputValue.length > 1 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="spot-suggestion-dropdown">
          {suggestions.map((place) => (
            <li key={place.id} onClick={() => handleSelect(place)}>
              <span>{place.name}</span>
              <span style={{ color: "#888", fontSize: "0.9em", marginLeft: 6 }}>
                {place.roadAddress || place.address}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Curating = () => {
  const [spots, setSpots] = useState([{ name: "" }]);
  const [itinerary, setItinerary] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSpotChange = (idx, value) => {
    const newSpots = [...spots];
    newSpots[idx].name = value;
    setSpots(newSpots);
  };

  const addSpot = () => setSpots([...spots, { name: "" }]);

  const formatDate = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const generateItinerary = () => {
    // 실제 구현에서는 AI/백엔드 호출
    setItinerary({
      date:
        startDate && endDate
          ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
          : "Friday, April 25",
      start: spots[0].name,
      route: [
        { name: "Seongsu-dong Café", time: "9:00 AM - 10:30 AM", icon: "cafe" },
        {
          name: "Bukchon Hanok Village",
          time: "10:30 AM - 12:00 PM",
          icon: "hanok",
        },
        { name: "COEX", time: "12:30 PM - 2:00 PM", icon: "mall" },
      ],
    });
  };

  return (
    <div className="curating-container">
      <h1>Curating</h1>
      <p>Enter must-visit spots and get your full itinerary!</p>
      <div className="date-range-inputs">
        <div
          style={{
            justifyContent: "space-between !important",
          }}
        >
          <label>Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select start date"
            className="custom-datepicker"
          />
        </div>
        <div>
          <label>End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select end date"
            className="custom-datepicker"
          />
        </div>
      </div>
      <div className="spot-inputs">
        {spots.map((spot, idx) => (
          <SpotInput
            key={idx}
            value={spot.name}
            onChange={(val) => handleSpotChange(idx, val)}
          />
        ))}
        <button onClick={addSpot}>+ Add Spot</button>
      </div>
      <button className="generate-btn" onClick={generateItinerary}>
        Generate Itinerary
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

export default Curating;
