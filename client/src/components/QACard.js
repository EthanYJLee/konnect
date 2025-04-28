import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/QACard.css";

const QACard = ({ question, answer, date, category }) => {
  const { t } = useTranslation();

  const handleReport = () => {
    // TODO: Implement report functionality
    console.log("Report clicked for:", { question, answer });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    // TODO: Show copy success message
  };

  return (
    <div className="qa-card">
      <div className="qa-header">
        <span className="category-badge">{category}</span>
        <span className="date">{new Date(date).toLocaleDateString()}</span>
      </div>

      <div className="qa-content">
        <div className="question">
          <h3>{t("history.question")}</h3>
          <p>{question}</p>
        </div>

        <div className="answer">
          <h3>{t("history.answer")}</h3>
          <p>{answer}</p>
        </div>
      </div>

      <div className="qa-actions">
        <button
          className="action-button copy"
          onClick={handleCopy}
          title={t("history.copy")}
        >
          📋
        </button>
        <button
          className="action-button report"
          onClick={handleReport}
          title={t("history.report")}
        >
          ⚠️
        </button>
      </div>
    </div>
  );
};

export default QACard;
