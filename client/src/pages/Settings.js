import { React, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/Settings.scss";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  const [message, setMessage] = useState("");

  const fetchData = () => {
    const url = process.env.REACT_APP_WAS_URL;
    axios
      .get(`${url}/checkIpPort`, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data);
        setMessage(response.data); // 서버에서 받은 메시지
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div className="settings-modern-container">
      <div className="settings-columns">
        {/* <div className="settings-col">
          <h2>{t("settings.language")}</h2>
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </div> */}
        <div className="settings-col">
          <h2>{t("settings.theme")}</h2>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "light" ? t("theme.dark") : t("theme.light")}
          </button>
        </div>
        <div className="settings-col">
          <h2>{t("settings.notifications")}</h2>
          <div className="notification-settings">
            <label>
              <input type="checkbox" />
              {t("settings.enableNotifications")}
            </label>
          </div>
        </div>
        <div className="settings-col">
          <button onClick={fetchData}>네트워크 확인</button>
          <p>{message}</p>
        </div>
      </div>
      <div className="settings-footer">
        <hr />
        <p>© 2024 K-Life Assistant. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Settings;
