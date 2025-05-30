import React, { useState, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../styles/SpotInput.scss";
import { useRateLimit } from "../contexts/RateLimitContext";

const url = process.env.REACT_APP_WAS_URL;

const SpotInput = ({ value, onChange, onRemove, showRemoveButton }) => {
  const { checkSearchLimit, getRemainingRequests, getTimeToReset } = useRateLimit();
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value?.name || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showClearButton, setShowClearButton] = useState(!!value?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLimited, setSearchLimited] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
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
    // Focus back on the input after clearing
    inputRef.current?.focus();
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
    
    // 검색 요청 제한 확인
    if (!checkSearchLimit()) {
      setSearchLimited(true);
      setSuggestions([
        {
          id: "rate-limit",
          name: t("curation.searchLimitReached", "검색 한도 도달"),
          formatted_address: t(
            "curation.searchLimitMessage",
            "{{minutes}}분 후에 다시 시도해주세요",
            { minutes: getTimeToReset("search") }
          ),
          isError: true,
        },
      ]);
      setShowDropdown(true);
      return [];
    }
    
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
      if (!searchLimited) {
        setSuggestions(results);
        setShowDropdown(true);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (place) => {
    // 오류 메시지인 경우 선택하지 않음
    if (place.isError) return;
    
    setInputValue(place.name);
    setShowDropdown(false);
    setShowClearButton(true);
    onChange(place); // Pass the entire place object
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (inputValue.length > 1) {
      setShowDropdown(true);
    }
  };

  const handleBlur = (e) => {
    // 클릭된 요소가 삭제 버튼이나 드롭다운 내부가 아닐 때만 상태 변경
    const clickedElement = e.relatedTarget;
    const isDropdownClick = clickedElement?.closest('.spot-suggestion-dropdown');
    const isRemoveButtonClick = clickedElement?.classList.contains("remove-spot-btn");
    
    if (!isDropdownClick && !isRemoveButtonClick) {
      setIsFocused(false);
      setTimeout(() => setShowDropdown(false), 150);
    }
  };

  return (
    <div className={`spot-input-container ${isFocused ? "focused" : ""}`}>
      <div className="spot-input-wrapper">
        <div className="spot-input-field">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInput}
            placeholder={t(
              "curation.spotPlaceholder",
              "장소를 입력하세요 (예: 카페, 명소 등)"
            )}
            autoComplete="off"
            className="spot-autocomplete-input"
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            <li 
              key={place.id} 
              onClick={() => handleSelect(place)} 
              className={place.isError ? "suggestion-error" : ""}
            >
              <div className="suggestion-content">
                <span className="suggestion-name">{place.name}</span>
                <span className="suggestion-address">{place.formatted_address}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!showDropdown && searchLimited && (
        <div className="rate-limit-warning">
          {t("curation.remainingSearches", "남은 검색: {{count}}/{{total}}", {
            count: getRemainingRequests("search"),
            total: 20
          })}
        </div>
      )}
    </div>
  );
};

export default SpotInput; 