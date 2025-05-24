import React, { useState, useEffect } from "react";
import "../styles/Toast.scss";
import { useTranslation } from "react-i18next";

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 400); // 페이드아웃 애니메이션 후 제거
    }, 4000); // Longer display time for better readability

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastClass = () => {
    let baseClass = `toast ${isVisible ? "show" : "hide"}`;

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

  // Get toast title based on type
  const getToastTitle = () => {
    switch (type) {
      case "warning":
        return t("toast.warning", "Warning");
      case "error":
        return t("toast.error", "Error");
      case "success":
        return t("toast.success", "Success");
      default:
        return t("toast.info", "Notice");
    }
  };

  // 토스트 타입에 따른 아이콘 선택
  const getToastIcon = () => {
    switch (type) {
      case "warning":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v7h-2zm0 8h2v2h-2z"/>
          </svg>
        );
      case "error":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"/>
          </svg>
        );
      case "success":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13l-2 2 5 5 7-7-2-2-5 5z"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v7h-2zm0-4h2v2h-2z"/>
          </svg>
        );
    }
  };

  return (
    <div className={getToastClass()}>
      <div className="toast-icon">
        {getToastIcon()}
      </div>
      <div className="toast-content">
        <div className="toast-title">{getToastTitle()}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 400);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast; 