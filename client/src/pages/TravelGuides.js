import React from "react";
import { useTranslation } from "react-i18next";
import { Container } from "react-bootstrap";
import "../styles/TravelGuides.scss";

const TravelGuides = () => {
  const { t } = useTranslation();

  return (
    <div className="travel-guides-page">
      <div className="travel-guides-coming-soon">
        <Container className="text-center">
          <h1>{t("travelGuides.title", "Travel Guides")}</h1>
          <div className="coming-soon-container">
            <h2>{t("travelGuides.comingSoon", "Coming Soon")}</h2>
            <p>
              {t(
                "travelGuides.preparingMessage",
                "We are preparing our travel guides. Please check back later."
              )}
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default TravelGuides;
