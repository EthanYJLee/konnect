import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/FAQCategory.scss";

const FAQCategory = ({ category, isOpen, onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="faq-category">
      <div
        className={`category-header ${isOpen ? "open" : ""}`}
        onClick={onToggle}
      >
        <h2>{t(`faq.categories.${category}`)}</h2>
        <span className="toggle-icon">{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && (
        <div className="category-content">
          {[1, 2, 3].map((index) => (
            <div key={index} className="qa-item">
              <div className="question">{t(`faq.${category}.q${index}`)}</div>
              <div className="answer">{t(`faq.${category}.a${index}`)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQCategory;
