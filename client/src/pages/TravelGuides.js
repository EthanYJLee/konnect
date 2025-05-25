import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, Form, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import "../styles/TravelGuides.scss";

const TravelGuides = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Mock data for guides - in a real app this would come from an API
  useEffect(() => {
    const guidesData = [
      {
        id: 1,
        title: "Seoul City Guide",
        description:
          "Explore the vibrant capital of South Korea with our comprehensive guide.",
        image:
          "https://images.unsplash.com/photo-1538485399081-7c8be987171a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Seoul",
        tags: ["city", "shopping", "culture", "food"],
      },
      {
        id: 2,
        title: "Busan Coastal Experience",
        description:
          "Discover beaches, seafood, and cultural attractions in Korea's second-largest city.",
        image:
          "https://images.unsplash.com/photo-1587297356106-8aaccc230ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Busan",
        tags: ["beach", "seafood", "temples"],
      },
      {
        id: 3,
        title: "Jeju Island Adventure",
        description:
          "Your guide to volcanic landscapes, beaches, and unique culture of Jeju Island.",
        image:
          "https://images.unsplash.com/photo-1611278200308-aa2634af3e49?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Jeju",
        tags: ["nature", "hiking", "beach", "food"],
      },
      {
        id: 4,
        title: "Gyeongju Historical Sites",
        description:
          "Explore ancient temples and historical landmarks in Korea's museum without walls.",
        image:
          "https://images.unsplash.com/photo-1626016752126-34a54272754f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Gyeongsang",
        tags: ["history", "temples", "culture"],
      },
      {
        id: 5,
        title: "Incheon Modern City",
        description:
          "Discover the gateway to Korea with its mix of modern attractions and historical sites.",
        image:
          "https://images.unsplash.com/photo-1597732081142-2dfd21df5048?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Incheon",
        tags: ["city", "modern", "shopping"],
      },
      {
        id: 6,
        title: "Suwon Hwaseong Fortress",
        description:
          "Visit this UNESCO World Heritage site and explore traditional Korean architecture.",
        image:
          "https://images.unsplash.com/photo-1548132285-6541de47f05d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Gyeonggi",
        tags: ["history", "architecture", "culture"],
      },
      {
        id: 7,
        title: "Gangwon Winter Sports",
        description:
          "Your ultimate guide to ski resorts and winter activities in Gangwon Province.",
        image:
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Gangwon",
        tags: ["winter", "skiing", "nature"],
      },
      {
        id: 8,
        title: "Jeonju Traditional Experience",
        description:
          "Experience traditional Korean culture, hanok villages, and famous bibimbap.",
        image:
          "https://images.unsplash.com/photo-1604555440265-76fea06c0ce6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Jeolla",
        tags: ["tradition", "food", "hanok"],
      },
      {
        id: 9,
        title: "Daegu City Exploration",
        description:
          "Discover this vibrant city known for its markets, mountains, and cultural festivals.",
        image:
          "https://images.unsplash.com/photo-1546179830-33e4d503ccf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        region: "Gyeongsang",
        tags: ["city", "shopping", "festivals"],
      },
    ];

    setGuides(guidesData);
    setFilteredGuides(guidesData);

    // Extract unique regions for filter
    const uniqueRegions = [...new Set(guidesData.map((guide) => guide.region))];
    setRegions(uniqueRegions);
  }, []);

  // Filter guides based on search term and region
  useEffect(() => {
    let filtered = guides;

    if (searchTerm) {
      filtered = filtered.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          guide.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedRegion && selectedRegion !== "all") {
      filtered = filtered.filter((guide) => guide.region === selectedRegion);
    }

    setFilteredGuides(filtered);
  }, [searchTerm, selectedRegion, guides]);

  return (
    <div className="travel-guides-page">
      <div className="travel-guides-hero">
        <Container>
          <h1>{t("travelGuides.title", "Travel Guides")}</h1>
          <p className="lead">
            {t(
              "travelGuides.subtitle",
              "Discover the best of Korea with our curated travel guides"
            )}
          </p>

          <div className="search-filters">
            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder={t(
                      "travelGuides.searchPlaceholder",
                      "Search guides, destinations, or activities..."
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </InputGroup.Text>
                  <Form.Select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="all">
                      {t("travelGuides.allRegions", "All Regions")}
                    </option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="guides-container">
        <Row>
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide) => (
              <Col key={guide.id} lg={4} md={6} className="mb-4">
                <Card className="guide-card">
                  <div className="guide-image-container">
                    <Card.Img
                      variant="top"
                      src={guide.image}
                      alt={guide.title}
                      className="guide-image"
                    />
                    <div className="guide-region">{guide.region}</div>
                  </div>
                  <Card.Body>
                    <Card.Title>{guide.title}</Card.Title>
                    <Card.Text>{guide.description}</Card.Text>
                    <div className="guide-tags">
                      {guide.tags.map((tag, index) => (
                        <span key={index} className="guide-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="read-more-btn">
                      {t("travelGuides.readMore", "Read More")}
                    </button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center py-5">
              <p className="no-results">
                {t(
                  "travelGuides.noResults",
                  "No guides found matching your criteria. Please try different search terms."
                )}
              </p>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default TravelGuides;
