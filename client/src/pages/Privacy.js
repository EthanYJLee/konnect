import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "react-bootstrap";
import "../styles/Legal.scss";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="legal-page privacy-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <div className="legal-content">
              <h1>{t("legal.privacy.title", "Privacy Policy")}</h1>
              <p className="last-updated">
                {t("legal.lastUpdated", "Last updated")}: May 25, 2025
              </p>

              <section>
                <h2>{t("legal.privacy.intro", "Introduction")}</h2>
                <p>
                  {t(
                    "legal.privacy.introText",
                    "This Privacy Policy describes how Konnect collects, uses, and discloses your personal information when you use our website and services. By using Konnect, you agree to the collection and use of information in accordance with this policy."
                  )}
                </p>
              </section>

              <section>
                <h2>
                  {t("legal.privacy.collection", "Information Collection")}
                </h2>
                <p>
                  {t(
                    "legal.privacy.collectionText1",
                    "We collect several different types of information for various purposes to provide and improve our service to you:"
                  )}
                </p>
                <ul>
                  <li>
                    <strong>
                      {t("legal.privacy.personal", "Personal Data")}:
                    </strong>{" "}
                    {t(
                      "legal.privacy.personalText",
                      "While using our service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, including but not limited to your name, email address, phone number, and payment information."
                    )}
                  </li>
                  <li>
                    <strong>{t("legal.privacy.usage", "Usage Data")}:</strong>{" "}
                    {t(
                      "legal.privacy.usageText",
                      "We may also collect information on how the service is accessed and used. This may include your computer's Internet Protocol address, browser type, browser version, pages visited, time and date of your visit, time spent on those pages, and other diagnostic data."
                    )}
                  </li>
                  <li>
                    <strong>{t("legal.privacy.cookies", "Cookies")}:</strong>{" "}
                    {t(
                      "legal.privacy.cookiesText",
                      "We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier."
                    )}
                  </li>
                </ul>
              </section>

              <section>
                <h2>{t("legal.privacy.use", "Use of Data")}</h2>
                <p>
                  {t(
                    "legal.privacy.useText",
                    "Konnect uses the collected data for various purposes:"
                  )}
                </p>
                <ul>
                  <li>
                    {t(
                      "legal.privacy.useItem1",
                      "To provide and maintain our service"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.useItem2",
                      "To notify you about changes to our service"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.useItem3",
                      "To allow you to participate in interactive features of our service when you choose to do so"
                    )}
                  </li>
                  <li>
                    {t("legal.privacy.useItem4", "To provide customer support")}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.useItem5",
                      "To gather analysis or valuable information so that we can improve our service"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.useItem6",
                      "To monitor the usage of our service"
                    )}
                  </li>
                  <li>
                    {t(
                      "legal.privacy.useItem7",
                      "To detect, prevent and address technical issues"
                    )}
                  </li>
                </ul>
              </section>

              <section>
                <h2>{t("legal.privacy.sharing", "Sharing of Data")}</h2>
                <p>
                  {t(
                    "legal.privacy.sharingText1",
                    "We may share your personal information in the following situations:"
                  )}
                </p>
                <ul>
                  <li>
                    <strong>
                      {t(
                        "legal.privacy.sharingService",
                        "With Service Providers"
                      )}
                      :
                    </strong>{" "}
                    {t(
                      "legal.privacy.sharingServiceText",
                      "We may share your information with service providers to monitor and analyze the use of our service, to process payments, or to contact you."
                    )}
                  </li>
                  <li>
                    <strong>
                      {t(
                        "legal.privacy.sharingBusiness",
                        "For Business Transfers"
                      )}
                      :
                    </strong>{" "}
                    {t(
                      "legal.privacy.sharingBusinessText",
                      "We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company."
                    )}
                  </li>
                  <li>
                    <strong>
                      {t(
                        "legal.privacy.sharingLegal",
                        "For Legal Requirements"
                      )}
                      :
                    </strong>{" "}
                    {t(
                      "legal.privacy.sharingLegalText",
                      "We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process."
                    )}
                  </li>
                </ul>
              </section>

              <section>
                <h2>{t("legal.privacy.security", "Data Security")}</h2>
                <p>
                  {t(
                    "legal.privacy.securityText",
                    "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security."
                  )}
                </p>
              </section>

              <section>
                <h2>
                  {t("legal.privacy.international", "International Transfer")}
                </h2>
                <p>
                  {t(
                    "legal.privacy.internationalText",
                    "Your information, including personal data, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. If you are located outside Korea and choose to provide information to us, please note that we transfer the data to Korea and process it there."
                  )}
                </p>
              </section>

              <section>
                <h2>
                  {t("legal.privacy.changes", "Changes to This Privacy Policy")}
                </h2>
                <p>
                  {t(
                    "legal.privacy.changesText",
                    "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'last updated' date at the top of this page."
                  )}
                </p>
              </section>

              <section>
                <h2>{t("legal.privacy.contact", "Contact Us")}</h2>
                <p>
                  {t(
                    "legal.privacy.contactText",
                    "If you have any questions about this Privacy Policy, please contact us at: "
                  )}
                  <a href="mailto:lyj72011648@gmail.com">
                    lyj72011648@gmail.com
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

export default Privacy;
