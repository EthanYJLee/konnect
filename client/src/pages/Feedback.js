import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import "../styles/Feedback.scss";

const Feedback = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
    rating: 0,
  });
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    {
      id: "general",
      name: t("feedback.categories.general", "General Experience"),
    },
    { id: "ui", name: t("feedback.categories.ui", "User Interface") },
    {
      id: "features",
      name: t("feedback.categories.features", "Features & Functionality"),
    },
    {
      id: "itinerary",
      name: t("feedback.categories.itinerary", "Itinerary Planning"),
    },
    {
      id: "recommendations",
      name: t("feedback.categories.recommendations", "Recommendations"),
    },
    {
      id: "bugs",
      name: t("feedback.categories.bugs", "Technical Issues/Bugs"),
    },
    { id: "other", name: t("feedback.categories.other", "Other") },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // In a real app, this would send the data to a server
    console.log("Feedback submitted:", formData);

    // Simulate successful submission
    setSubmitted(true);
    setError("");
    setFormData({
      name: "",
      email: "",
      category: "",
      message: "",
      rating: 0,
    });
    setValidated(false);
  };

  return (
    <div className="feedback-page">
      <div className="feedback-hero">
        <Container>
          <h1>{t("feedback.title", "Your Feedback Matters")}</h1>
          <p className="lead">
            {t(
              "feedback.subtitle",
              "Help us improve your experience with Konnect. We value your thoughts and suggestions."
            )}
          </p>
        </Container>
      </div>

      <Container className="feedback-container">
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <div className="feedback-form-container">
              <div className="feedback-intro">
                <h2>{t("feedback.shareThoughts", "Share Your Thoughts")}</h2>
                <p>
                  {t(
                    "feedback.introText",
                    "Your feedback helps us enhance our service and create a better travel planning experience. Let us know what you think about Konnect."
                  )}
                </p>
              </div>

              {submitted && (
                <Alert variant="success" className="mb-4">
                  {t(
                    "feedback.thankYou",
                    "Thank you for your feedback! Your input helps us improve Konnect for everyone."
                  )}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <div className="rating-section">
                  <h3>
                    {t(
                      "feedback.overallExperience",
                      "Rate Your Overall Experience"
                    )}
                  </h3>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${
                          formData.rating >= star ? "active" : "inactive"
                        }`}
                        onClick={() => handleRatingClick(star)}
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </span>
                    ))}
                  </div>
                  <div className="rating-text">
                    {formData.rating > 0 && (
                      <span>
                        {t(
                          `feedback.ratingText.${formData.rating}`,
                          formData.rating === 1
                            ? "Poor"
                            : formData.rating === 2
                            ? "Fair"
                            : formData.rating === 3
                            ? "Good"
                            : formData.rating === 4
                            ? "Very Good"
                            : "Excellent"
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="feedbackName">
                      <Form.Label>{t("feedback.name", "Name")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t("feedback.namePlaceholder", "Your name")}
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("feedback.nameRequired", "Please enter your name")}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="feedbackEmail">
                      <Form.Label>{t("feedback.email", "Email")}</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t(
                          "feedback.emailPlaceholder",
                          "Your email address"
                        )}
                      />
                      <Form.Control.Feedback type="invalid">
                        {t(
                          "feedback.emailRequired",
                          "Please enter a valid email address"
                        )}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="feedbackCategory">
                  <Form.Label>
                    {t("feedback.category", "Feedback Category")}
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      {t("feedback.selectCategory", "Select a category")}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {t("feedback.categoryRequired", "Please select a category")}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="feedbackMessage">
                  <Form.Label>
                    {t("feedback.message", "Your Feedback")}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder={t(
                      "feedback.messagePlaceholder",
                      "Please share your feedback, suggestions, or report any issues you've encountered..."
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t(
                      "feedback.messageRequired",
                      "Please enter your feedback"
                    )}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="text-center">
                  <Button
                    type="submit"
                    variant="primary"
                    className="submit-button"
                    disabled={submitted || formData.rating === 0}
                  >
                    {t("feedback.submit", "Submit Feedback")}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Feedback;
