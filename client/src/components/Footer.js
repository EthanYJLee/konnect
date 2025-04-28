import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/Footer.css";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t("footer.about")}</h3>
          <p>{t("footer.description")}</p>
        </div>

        <div className="footer-section">
          <h3>{t("footer.links")}</h3>
          <ul>
            <li>
              <a href="/privacy">{t("footer.privacy")}</a>
            </li>
            <li>
              <a href="/terms">{t("footer.terms")}</a>
            </li>
            <li>
              <a href="/contact">{t("footer.contact")}</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>{t("footer.support")}</h3>
          <ul>
            <li>
              <a href="/help">{t("footer.help")}</a>
            </li>
            <li>
              <a href="/feedback">{t("footer.feedback")}</a>
            </li>
            <li>
              <a href="/report">{t("footer.report")}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} K-Life Assistant. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
