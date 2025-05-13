import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FAQCategory from "../components/FAQCategory";
import "../styles/FAQ.scss";

const FAQ = () => {
  const { t } = useTranslation();
  const [openCategory, setOpenCategory] = useState(null);

  const categories = [
    "transportation",
    "banking",
    "telecom",
    "healthcare",
    "visa",
    "housing",
  ];

  const handleCategoryClick = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  return (
    <div className="faq-container">
      {/* <h1>{t("faq.title")}</h1> */}
      <div className="faq-categories">
        {categories.map((category) => (
          <FAQCategory
            key={category}
            category={category}
            title={t(`faq.categories.${category}`)}
            isOpen={openCategory === category}
            onToggle={() => handleCategoryClick(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
