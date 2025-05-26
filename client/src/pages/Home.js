import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faLanguage,
  faMapMarkedAlt,
  faComments,
  faArrowRight,
  faCalendarAlt,
  faMapMarkerAlt,
  faPlus,
  faMapSigns,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.scss";
import generateItinerary from "../assets/images/generate_itinerary.png";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // 임시 기능 데이터
  const features = [
    {
      id: 1,
      icon: faRoute,
      title: t("home.features.itinerary.title"),
      description: t("home.features.itinerary.description"),
      link: "/curation",
    },
    {
      id: 2,
      icon: faMapMarkedAlt,
      title: t("home.features.localInsights.title"),
      description: t("home.features.localInsights.description"),
      link: "/map",
    },
    {
      id: 3,
      icon: faLanguage,
      title: t("home.features.translation.title"),
      description: t("home.features.translation.description"),
      link: "/translation",
    },
    {
      id: 4,
      icon: faComments,
      title: t("home.features.chatbot.title"),
      description: t("home.features.chatbot.description"),
      link: "/chat",
    },
  ];

  const handleStartPlanning = () => {
    if (isLoggedIn) {
      navigate("/curation");
    } else {
      navigate("/login");
    }
  };

  const handleNavigate = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-page">
      {/* 히어로 섹션 */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="hero-content">
              {t("home.hero.title")
                .split("\n")
                .map((line, index) => (
                  <h1
                    key={index}
                    className={index === 1 ? "indented-line" : ""}
                  >
                    {line}
                  </h1>
                ))}
              <p className="lead">{t("home.hero.subtitle")}</p>
              <Button
                variant="primary"
                size="lg"
                className="hero-button"
                onClick={handleStartPlanning}
              >
                {t("home.hero.button")}
              </Button>
            </Col>
            <Col lg={6} md={12} className="hero-image">
              <div className="travel-planner-preview">
                <img
                  src={generateItinerary}
                  alt="Travel Itinerary Generator"
                  className="img-fluid"
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 사용 방법 섹션 */}
      <div className="how-it-works-section">
        <Container>
          <div className="section-header text-center">
            <h2>{t("home.howItWorks.title", "How It Works")}</h2>
            <p className="section-subtitle">
              {t(
                "home.howItWorks.subtitle",
                "Plan your perfect trip in just 3 simple steps"
              )}
            </p>
          </div>

          <Row className="mt-5">
            <Col md={4} className="step-container">
              <div className="step-circle">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3>{t("home.howItWorks.step1.title", "Select Destinations")}</h3>
              <p>
                {t(
                  "home.howItWorks.step1.description",
                  "Choose your departure and arrival cities"
                )}
              </p>
            </Col>
            <Col md={4} className="step-container">
              <div className="step-circle">
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <h3>
                {t("home.howItWorks.step2.title", "Add Must-Visit Spots")}
              </h3>
              <p>
                {t(
                  "home.howItWorks.step2.description",
                  "Tell us places you don't want to miss"
                )}
              </p>
            </Col>
            <Col md={4} className="step-container">
              <div className="step-circle">
                <FontAwesomeIcon icon={faMapSigns} />
              </div>
              <h3>{t("home.howItWorks.step3.title", "Generate Itinerary")}</h3>
              <p>
                {t(
                  "home.howItWorks.step3.description",
                  "Get your complete trip plan with maps"
                )}
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 결과 미리보기 섹션 */}
      <div className="result-preview-section">
        <Container>
          <div className="section-header text-center">
            <h2>{t("home.resultPreview.title", "See Your Travel Plan")}</h2>
            <p className="section-subtitle">
              {t(
                "home.resultPreview.subtitle",
                "Explore your detailed daily itinerary with interactive maps"
              )}
            </p>
          </div>

          <Row className="align-items-center mt-5">
            <Col lg={6} md={12} className="mb-4">
              <div className="result-description">
                <h3>
                  {t(
                    "home.resultPreview.features.title",
                    "Smart Itinerary Features"
                  )}
                </h3>
                <ul className="feature-list">
                  <li>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="feature-icon"
                    />
                    <span>
                      {t(
                        "home.resultPreview.features.daily",
                        "Day-by-day organized plan"
                      )}
                    </span>
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faMapMarkedAlt}
                      className="feature-icon"
                    />
                    <span>
                      {t(
                        "home.resultPreview.features.map",
                        "Interactive maps for each day"
                      )}
                    </span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faRoute} className="feature-icon" />
                    <span>
                      {t(
                        "home.resultPreview.features.efficient",
                        "Optimized travel routes"
                      )}
                    </span>
                  </li>
                </ul>
                {/* <Button
                  variant="outline-primary"
                  className="mt-3"
                  onClick={() => handleNavigate("/curation")}
                >
                  {t("home.resultPreview.tryNow", "Create Your Itinerary")}
                </Button> */}
              </div>
            </Col>
            <Col lg={6} md={12}>
              <div className="itinerary-result-preview">
                <div className="result-header">
                  <h4>
                    🗺️{" "}
                    {t("home.resultPreview.demoTitle", "Your Travel Itinerary")}
                  </h4>
                </div>
                <div className="day-tabs">
                  <span className="day-tab">Day 1</span>
                  <span className="day-tab active">Day 2</span>
                  <span className="day-tab">Day 3</span>
                  <span className="day-tab">Day 4</span>
                  <span className="day-tab">Day 5</span>
                </div>
                <div className="day-content">
                  <div className="day-title">Thursday, May 29, 2025</div>
                  <div className="spot-list">
                    <div className="spot-item">
                      <div className="spot-number">1</div>
                      <div className="spot-details">
                        <div className="spot-name">
                          Seongsu-dong Café Street
                        </div>
                        <div className="spot-location">
                          Seongdong-gu • Seongsu 2-ga
                        </div>
                      </div>
                    </div>
                    <div className="spot-item">
                      <div className="spot-number">2</div>
                      <div className="spot-details">
                        <div className="spot-name">K-POP Square</div>
                        <div className="spot-location">
                          Gangnam-gu • Samsung 1-dong
                        </div>
                      </div>
                    </div>
                    <div className="spot-item">
                      <div className="spot-number">3</div>
                      <div className="spot-details">
                        <div className="spot-name">Nodaji Pumba</div>
                        <div className="spot-location">
                          Jongno-gu • Jongno 35-gil
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="map-preview"></div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 주요 기능 소개 섹션 */}
      <div className="features-section">
        <Container>
          <div className="section-header text-center">
            <h2>{t("home.features.title")}</h2>
            <p className="section-subtitle">{t("home.features.subtitle")}</p>
          </div>

          <Row className="mt-5">
            {features.map((feature) => (
              <Col lg={3} md={6} sm={12} key={feature.id} className="mb-4">
                <Card className="feature-card h-100">
                  <div className="feature-icon">
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <Card.Body>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text>{feature.description}</Card.Text>
                  </Card.Body>
                  {/* <Card.Footer className="text-end bg-transparent border-0">
                    <Button
                      variant="link"
                      className="feature-link p-0"
                      onClick={() => handleNavigate(feature.link)}
                    >
                      {t("home.features.learnMore")}{" "}
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Button>
                  </Card.Footer> */}
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* CTA 섹션 */}
      <div className="cta-section">
        <Container>
          <div className="cta-content text-center">
            <h2>
              {t(
                "home.cta.title",
                "Ready to plan your perfect Korean adventure?"
              )}
            </h2>
            <p>
              {t(
                "home.cta.subtitle",
                "Create your customized travel itinerary in minutes"
              )}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="cta-button"
              onClick={handleStartPlanning}
            >
              {t("home.cta.button", "Start Planning Now")}
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Home;
