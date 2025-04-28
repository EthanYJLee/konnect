import React from "react";
import { useTranslation } from "react-i18next";
import FAQCategory from "../components/FAQCategory";
import "../styles/FAQ.css";

const FAQ = () => {
  const { t } = useTranslation();

  const categories = [
    "transportation",
    "banking",
    "telecom",
    "healthcare",
    "visa",
    "housing",
  ];

  return (
    <div className="faq-container">
      <h1>{t("faq.title")}</h1>
      <div className="faq-categories">
        {categories.map((category) => (
          <FAQCategory
            key={category}
            category={category}
            title={t(`faq.categories.${category}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
