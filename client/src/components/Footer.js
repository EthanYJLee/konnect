import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "../styles/Footer.scss";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section company">
          <h3>{t("footer.about", "About Konnect")}</h3>
          <p>
            {t(
              "footer.description",
              "Your personalized travel assistant for Korea"
            )}
          </p>
          {/* <div className="social-links">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div> */}
        </div>

        <div className="footer-section">
          <h3>{t("footer.travel", "Travel Resources")}</h3>
          <ul>
            <li>
              <Link to="/travel-guides">
                {t("footer.travelGuides", "Travel Guides")}
              </Link>
            </li>
            <li>
              <Link to="/destinations">
                {t("footer.destinations", "Popular Destinations")}
              </Link>
            </li>
            <li>
              <Link to="/travel-tips">
                {t("footer.travelTips", "Travel Tips")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t("footer.help", "Help & Support")}</h3>
          <ul>
            <li>
              <Link to="/faq">{t("footer.faq", "FAQ")}</Link>
            </li>
            <li>
              <Link to="/contact">{t("footer.contact", "Contact Us")}</Link>
            </li>
            <li>
              <Link to="/feedback">
                {t("footer.feedback", "Give Feedback")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t("footer.legal", "Legal")}</h3>
          <ul>
            <li>
              <Link to="/terms">{t("footer.terms", "Terms of Service")}</Link>
            </li>
            <li>
              <Link to="/privacy">{t("footer.privacy", "Privacy Policy")}</Link>
            </li>
            <li>
              <Link to="/cookies">{t("footer.cookies", "Cookie Policy")}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} Konnect Travel Assistant.{" "}
          {t("footer.rights", "All rights reserved.")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
