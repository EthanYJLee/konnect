import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../styles/SpotInput.scss";

const url = process.env.REACT_APP_WAS_URL;

const SpotInput = ({ value, onChange, onRemove, showRemoveButton }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showClearButton, setShowClearButton] = useState(!!value?.name);
  const [isLoading, setIsLoading] = useState(false);
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
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/api/google/search`, {
        params: { query, lang: t("curation.language") },
      });
      return res.data.results || [];
    } catch (error) {
      console.error("Error fetching Google places from backend:", error);
      return [];
    } finally {
      setIsLoading(false);
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
    onChange(place); // Pass the entire place object
  };

  return (
    <div className="spot-input-container">
      <div className="spot-input-wrapper">
        <div className="spot-input-field">
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
          {isLoading && <div className="spot-input-loader"></div>}
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
            ⓧ
          </button>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="spot-suggestion-dropdown">
          {suggestions.map((place) => (
            <li key={place.id} onClick={() => handleSelect(place)}>
              <div className="suggestion-content">
                <span className="suggestion-name">{place.name}</span>
                <span className="suggestion-address">{place.formatted_address}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SpotInput; 