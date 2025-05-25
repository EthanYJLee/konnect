import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/Legal.scss";

const Cookies = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page cookies-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="legal-content">
              <h1>{t("legal.cookies.title", "Cookie Policy")}</h1>
              <p className="last-updated">
                {t("legal.lastUpdated", "Last updated")}: June 15, 2023
              </p>

              <section>
                <h2>{t("legal.cookies.intro", "Introduction")}</h2>
                <p>
                  {t(
                    "legal.cookies.introText",
                    "This Cookie Policy explains how Konnect uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.cookies.what", "What Are Cookies?")}</h2>
                <p>
                  {t(
                    "legal.cookies.whatText1",
                    "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information."
                  )}
                </p>
                <p>
                  {t(
                    "legal.cookies.whatText2",
                    "Cookies set by the website owner (in this case, Konnect) are called 'first-party cookies'. Cookies set by parties other than the website owner are called 'third-party cookies'. Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics)."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.cookies.why", "Why Do We Use Cookies?")}</h2>
                <p>
                  {t(
                    "legal.cookies.whyText",
                    "We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as 'essential' or 'strictly necessary' cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.cookies.types", "Types of Cookies We Use")}</h2>
                <p>
                  {t(
                    "legal.cookies.typesText",
                    "The specific types of first and third-party cookies served through our website and the purposes they perform include:"
                  )}
                </p>
                <ul>
                  <li>
                    <strong>
                      {t("legal.cookies.essential", "Essential Cookies:")}
                    </strong>{" "}
                    {t(
                      "legal.cookies.essentialText",
                      "These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions."
                    )}
                  </li>
                  <li>
                    <strong>
                      {t("legal.cookies.performance", "Performance Cookies:")}
                    </strong>{" "}
                    {t(
                      "legal.cookies.performanceText",
                      "These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you."
                    )}
                  </li>
                  <li>
                    <strong>
                      {t("legal.cookies.functional", "Functionality Cookies:")}
                    </strong>{" "}
                    {t(
                      "legal.cookies.functionalText",
                      "These cookies allow our website to remember choices you make when you use our website. The purpose of these cookies is to provide you with a more personal experience and to avoid you having to re-select your preferences every time you visit our website."
                    )}
                  </li>
                  <li>
                    <strong>
                      {t("legal.cookies.targeting", "Targeting Cookies:")}
                    </strong>{" "}
                    {t(
                      "legal.cookies.targetingText",
                      "These cookies are used to make advertising messages more relevant to you and your interests. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests."
                    )}
                  </li>
                </ul>
              </section>

              <section>
                <h2>{t("legal.cookies.control", "How Can You Control Cookies?")}</h2>
                <p>
                  {t(
                    "legal.cookies.controlText1",
                    "You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted."
                  )}
                </p>
                <p>
                  {t(
                    "legal.cookies.controlText2",
                    "Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.allaboutcookies.org."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.cookies.changes", "Changes to This Cookie Policy")}</h2>
                <p>
                  {t(
                    "legal.cookies.changesText",
                    "We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.cookies.contact", "Contact Us")}</h2>
                <p>
                  {t(
                    "legal.cookies.contactText",
                    "If you have any questions about our use of cookies or other technologies, please email us at: "
                  )}
                  <a href="mailto:privacy@konnect-travel.com">
                    privacy@konnect-travel.com
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

export default Cookies; 