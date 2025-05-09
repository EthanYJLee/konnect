import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QACard from "../components/QACard";
import axios from "axios";
import HistoryCard from "../components/HistoryCard";
import "../styles/History.css";

const History = () => {
  const { t } = useTranslation();
  // This would be replaced with actual data from a state management solution
  const [qaHistory] = React.useState([]);

  const token = localStorage.getItem("token");
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    console.log("history page");
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3030/api/history/fetch",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
      setPairs(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="history-container">
      <h1>{t("history.title")}</h1>
      {/* {qaHistory.length === 0 ? (
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
      )} */}
      <div>
        {pairs.map((pair, index) => (
          <HistoryCard
            key={index}
            userMessage={pair.userMessage}
            aiMessage={pair.aiMessage}
            createdAt={pair.createdAt}
          />
        ))}
      </div>
    </div>
  );
};

export default History;
