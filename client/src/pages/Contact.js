import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Contact.scss";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    console.log("Form submitted:", formData);

    // Simulate successful submission
    setSubmitted(true);
    setError("");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setValidated(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <Container>
          <h1>{t("contact.title", "Contact Us")}</h1>
          <p className="lead">
            {t(
              "contact.subtitle",
              "We'd love to hear from you. Reach out with any questions or feedback."
            )}
          </p>
        </Container>
      </div>

      <Container className="contact-container">
        <Row>
          <Col lg={4} md={5} className="mb-4 mb-md-0">
            <div className="contact-info">
              <h2>{t("contact.getInTouch", "Get in Touch")}</h2>
              <p>
                {t(
                  "contact.reachOut",
                  "Have questions about our services? Need help planning your trip? Our team is here to help you."
                )}
              </p>

              <div className="contact-methods">
                {/* <div className="contact-method">
                  <div className="icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="details">
                    <h3>{t("contact.visitUs", "Visit Us")}</h3>
                    <p>
                      123 Seoul Street, Gangnam District
                      <br />
                      Seoul, South Korea 06123
                    </p>
                  </div>
                </div> */}

                <div className="contact-method">
                  <div className="icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className="details">
                    <h3>{t("contact.emailUs", "Email Us")}</h3>
                    <p>
                      <a href="mailto:lyj72011648@gmail.com">
                        lyj72011648@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div className="details">
                    <h3>{t("contact.callUs", "Call Us")}</h3>
                    <p>
                      <a href="tel:+82-10-6587-0114">+82-10-6587-0114</a>
                    </p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="icon">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="details">
                    <h3>{t("contact.businessHours", "Business Hours")}</h3>
                    <p>
                      {t("contact.weekdays", "Monday-Friday")}: 9AM - 6PM KST
                      <br />
                      {t("contact.weekends", "Saturday")}: 10AM - 4PM KST
                      <br />
                      {t("contact.closed", "Sunday: Closed")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={8} md={7}>
            <div className="contact-form-container">
              <h2>{t("contact.sendMessage", "Send a Message")}</h2>

              {submitted && (
                <Alert variant="success" className="mb-4">
                  {t(
                    "contact.messageSent",
                    "Thank you! Your message has been sent successfully. We'll get back to you soon."
                  )}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="contactName">
                      <Form.Label>{t("contact.name", "Name")}</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t("contact.namePlaceholder", "Your name")}
                      />
                      <Form.Control.Feedback type="invalid">
                        {t("contact.nameRequired", "Please enter your name")}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="contactEmail">
                      <Form.Label>{t("contact.email", "Email")}</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t(
                          "contact.emailPlaceholder",
                          "Your email address"
                        )}
                      />
                      <Form.Control.Feedback type="invalid">
                        {t(
                          "contact.emailRequired",
                          "Please enter a valid email address"
                        )}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="contactSubject">
                  <Form.Label>{t("contact.subject", "Subject")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder={t(
                      "contact.subjectPlaceholder",
                      "What is this regarding?"
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("contact.subjectRequired", "Please enter a subject")}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="contactMessage">
                  <Form.Label>{t("contact.message", "Message")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder={t(
                      "contact.messagePlaceholder",
                      "How can we help you?"
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {t("contact.messageRequired", "Please enter your message")}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="submit-button"
                  disabled={submitted}
                >
                  {t("contact.send", "Send Message")}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;
