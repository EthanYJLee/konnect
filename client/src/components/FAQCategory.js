import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/FAQCategory.css";

const FAQCategory = ({ category, title }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // This would be replaced with actual data from an API or state management
  const [faqs] = useState([
    {
      question: t(`faq.${category}.q1`),
      answer: t(`faq.${category}.a1`),
    },
    {
      question: t(`faq.${category}.q2`),
      answer: t(`faq.${category}.a2`),
    },
    {
      question: t(`faq.${category}.q3`),
      answer: t(`faq.${category}.a3`),
    },
  ]);

  return (
    <div className="faq-category">
      <button
        className="category-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2>{title}</h2>
        <span className={`arrow ${isExpanded ? "expanded" : ""}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="question">
                <h3>{faq.question}</h3>
              </div>
              <div className="answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQCategory;
