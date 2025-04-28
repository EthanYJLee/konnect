import React from "react";
import { useTranslation } from "react-i18next";
import QACard from "../components/QACard";
import "../styles/History.css";

const History = () => {
  const { t } = useTranslation();
  // This would be replaced with actual data from a state management solution
  const [qaHistory] = React.useState([]);

  return (
    <div className="history-container">
      <h1>{t("history.title")}</h1>
      {qaHistory.length === 0 ? (
        <p className="no-history">{t("history.empty")}</p>
      ) : (
        <div className="qa-list">
          {qaHistory.map((qa, index) => (
            <QACard
              key={index}
              question={qa.question}
              answer={qa.answer}
              date={qa.date}
              category={qa.category}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
