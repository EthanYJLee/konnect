import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/Legal.scss";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page terms-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="legal-content">
              <h1>{t("legal.terms.title", "Terms of Service")}</h1>
              <p className="last-updated">
                {t("legal.lastUpdated", "Last updated")}: June 15, 2023
              </p>

              <section>
                <h2>{t("legal.terms.intro", "Introduction")}</h2>
                <p>
                  {t(
                    "legal.terms.introText",
                    "Welcome to Konnect. These Terms of Service govern your use of our website and services. By accessing or using Konnect, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access our service."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.terms.accounts", "User Accounts")}</h2>
                <p>
                  {t(
                    "legal.terms.accountsText1",
                    "When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service."
                  )}
                </p>
                <p>
                  {t(
                    "legal.terms.accountsText2",
                    "You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.terms.content", "User Content")}</h2>
                <p>
                  {t(
                    "legal.terms.contentText1",
                    "Our service allows you to post, store, and share content. You retain any rights that you had in your content before you submitted it to the service."
                  )}
                </p>
                <p>
                  {t(
                    "legal.terms.contentText2",
                    "You are solely responsible for all content that you upload, post, email, transmit, or otherwise make available via our service. We reserve the right to remove any content that violates these Terms or that we find objectionable."
                  )}
                </p>
              </section>

              <section>
                <h2>
                  {t("legal.terms.intellectual", "Intellectual Property")}
                </h2>
                <p>
                  {t(
                    "legal.terms.intellectualText",
                    "The service and its original content, features, and functionality are and will remain the exclusive property of Konnect and its licensors. The service is protected by copyright, trademark, and other laws of both Korea and foreign countries."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.terms.termination", "Termination")}</h2>
                <p>
                  {t(
                    "legal.terms.terminationText",
                    "We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease."
                  )}
                </p>
              </section>

              <section>
                <h2>
                  {t("legal.terms.limitations", "Limitation of Liability")}
                </h2>
                <p>
                  {t(
                    "legal.terms.limitationsText",
                    "In no event shall Konnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.terms.changes", "Changes")}</h2>
                <p>
                  {t(
                    "legal.terms.changesText",
                    "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.terms.contact", "Contact Us")}</h2>
                <p>
                  {t(
                    "legal.terms.contactText",
                    "If you have any questions about these Terms, please contact us at: "
                  )}
                  <a href="mailto:support@konnect-travel.com">
                    support@konnect-travel.com
                  </a>
                </p>
              </section>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Terms;
