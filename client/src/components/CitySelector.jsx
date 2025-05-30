import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/CitySelector.scss";

// 한국 주요 도시 목록
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

const CitySelector = ({ value, onChange, label, placeholder, customClass }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] || "en"; // 현재 언어 코드 (en, ko, ja, zh, vi 등)

  // 선택된 도시 이름 (현재 언어로)
  const selectedCityName = value
    ? koreanCities[value][currentLang] || koreanCities[value].en
    : "";

  return (
    <div className={`city-selector ${customClass || ""}`}>
      {label && <label>{label}</label>}
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
        {/* <div className="select-arrow"></div> */}
      </div>
    </div>
  );
};

export default CitySelector; 