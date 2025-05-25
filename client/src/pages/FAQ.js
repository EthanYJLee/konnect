import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Container,
  Row,
  Col,
  Accordion,
  Form,
  InputGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "../styles/FAQ.scss";

const FAQ = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // FAQ data - in a real app, this would come from an API or CMS
  const faqCategories = [
    { id: "general", name: t("faq.categories.general", "General") },
    { id: "account", name: t("faq.categories.account", "Account & Profile") },
    {
      id: "booking",
      name: t("faq.categories.booking", "Booking & Reservations"),
    },
    {
      id: "itinerary",
      name: t("faq.categories.itinerary", "Itinerary Planning"),
    },
    { id: "payment", name: t("faq.categories.payment", "Payment & Pricing") },
    {
      id: "technical",
      name: t("faq.categories.technical", "Technical Support"),
    },
  ];

  const faqItems = [
    {
      id: 1,
      category: "general",
      question: t("faq.general.q1", "What is Konnect?"),
      answer: t(
        "faq.general.a1",
        "Konnect is a comprehensive travel assistant platform designed to help travelers plan, organize, and enjoy their trips to Korea. We provide personalized itineraries, local recommendations, translation assistance, and travel resources all in one place."
      ),
    },
    {
      id: 2,
      category: "general",
      question: t(
        "faq.general.q2",
        "Is Konnect available in multiple languages?"
      ),
      answer: t(
        "faq.general.a2",
        "Yes, Konnect is available in multiple languages including English, Korean, Japanese, Chinese, and Vietnamese. You can change your language preference in your account settings."
      ),
    },
    {
      id: 3,
      category: "account",
      question: t("faq.account.q1", "How do I create an account?"),
      answer: t(
        "faq.account.a1",
        "You can create an account by clicking the 'Sign Up' button in the top right corner of our website. You'll need to provide your email address, create a password, and fill in some basic information. You can also sign up using your Google account for faster registration."
      ),
    },
    {
      id: 4,
      category: "account",
      question: t("faq.account.q2", "How can I reset my password?"),
      answer: t(
        "faq.account.a2",
        "If you've forgotten your password, click on the 'Login' button, then select 'Forgot Password'. Enter the email address associated with your account, and we'll send you instructions to reset your password."
      ),
    },
    {
      id: 5,
      category: "booking",
      question: t(
        "faq.booking.q1",
        "Can Konnect help me book hotels and activities?"
      ),
      answer: t(
        "faq.booking.a1",
        "Yes, Konnect offers integration with various booking services. You can search for hotels, restaurants, activities, and transportation options directly through our platform and make reservations with our partner services."
      ),
    },
    {
      id: 6,
      category: "booking",
      question: t("faq.booking.q2", "How do I cancel or modify a booking?"),
      answer: t(
        "faq.booking.a2",
        "To cancel or modify a booking, go to 'My Trips' in your account dashboard, select the relevant booking, and choose 'Modify' or 'Cancel'. Please note that cancellation policies vary depending on the service provider, and some bookings may be non-refundable or subject to cancellation fees."
      ),
    },
    {
      id: 7,
      category: "itinerary",
      question: t("faq.itinerary.q1", "How does the itinerary planner work?"),
      answer: t(
        "faq.itinerary.a1",
        "Our itinerary planner uses AI technology to create personalized travel plans based on your preferences, travel dates, interests, and budget. You can specify locations you want to visit, and our system will suggest the most efficient routes, recommended attractions, dining options, and activities."
      ),
    },
    {
      id: 8,
      category: "itinerary",
      question: t(
        "faq.itinerary.q2",
        "Can I share my itinerary with friends or family?"
      ),
      answer: t(
        "faq.itinerary.a2",
        "Yes, you can share your itineraries with friends and family through email, messaging apps, or by generating a shareable link. You can also collaborate on trip planning by inviting others to view or edit your itinerary."
      ),
    },
    {
      id: 9,
      category: "payment",
      question: t("faq.payment.q1", "What payment methods do you accept?"),
      answer: t(
        "faq.payment.a1",
        "We accept various payment methods including major credit/debit cards (Visa, Mastercard, American Express), PayPal, and selected local payment options. All payments are processed securely through our payment partners."
      ),
    },
    {
      id: 10,
      category: "payment",
      question: t("faq.payment.q2", "Is my payment information secure?"),
      answer: t(
        "faq.payment.a2",
        "Yes, we take payment security very seriously. We use industry-standard encryption and security protocols to protect your payment information. We do not store your complete credit card details on our servers."
      ),
    },
    {
      id: 11,
      category: "technical",
      question: t(
        "faq.technical.q1",
        "The app is not working correctly. What should I do?"
      ),
      answer: t(
        "faq.technical.a1",
        "If you're experiencing technical issues, try these steps: 1) Refresh the page, 2) Clear your browser cache and cookies, 3) Try using a different browser, 4) Check your internet connection. If the problem persists, please contact our support team with details of the issue and screenshots if possible."
      ),
    },
    {
      id: 12,
      category: "technical",
      question: t(
        "faq.technical.q2",
        "How do I report a bug or suggest a feature?"
      ),
      answer: t(
        "faq.technical.a2",
        "We appreciate your feedback! You can report bugs or suggest features by going to 'Help & Support' in your account menu and selecting 'Report a Bug' or 'Suggest a Feature'. Alternatively, you can email our support team directly at support@konnect-travel.com."
      ),
    },
  ];

  // Filter FAQ items based on search term and category
  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <Container>
          <h1>{t("faq.title", "Frequently Asked Questions")}</h1>
          <p className="lead">
            {t(
              "faq.subtitle",
              "Find answers to common questions about Konnect and travel in Korea"
            )}
          </p>

          <div className="faq-search">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                placeholder={t(
                  "faq.searchPlaceholder",
                  "Search for questions..."
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Container>
      </div>

      <Container className="faq-container">
        <Row>
          <Col lg={3} md={4} className="mb-4">
            <div className="faq-categories">
              <h3>{t("faq.categoriesTitle", "Categories")}</h3>
              <ul className="category-list">
                <li
                  className={activeCategory === "all" ? "active" : ""}
                  onClick={() => setActiveCategory("all")}
                >
                  {t("faq.allCategories", "All Categories")}
                </li>
                {faqCategories.map((category) => (
                  <li
                    key={category.id}
                    className={activeCategory === category.id ? "active" : ""}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={9} md={8}>
            <div className="faq-accordion">
              {filteredFAQs.length > 0 ? (
                <Accordion defaultActiveKey="0" alwaysOpen={false}>
                  {filteredFAQs.map((faq, index) => (
                    <Accordion.Item eventKey={index.toString()} key={faq.id}>
                      <Accordion.Header>
                        <span className="faq-question">{faq.question}</span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <p className="faq-answer">{faq.answer}</p>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <div className="no-results">
                  <p>
                    {t(
                      "faq.noResults",
                      "No questions found matching your search. Please try different keywords."
                    )}
                  </p>
                </div>
              )}
            </div>
          </Col>
        </Row>

        <div className="faq-contact-section">
          <h2>{t("faq.stillHaveQuestions", "Still have questions?")}</h2>
          <p>
            {t(
              "faq.contactText",
              "If you couldn't find the answer to your question, our support team is here to help."
            )}
          </p>
          <a href="/contact" className="contact-btn">
            {t("faq.contactUs", "Contact Us")}
          </a>
        </div>
      </Container>
    </div>
  );
};

export default FAQ;
