import Logo from "../Logo/Logo";
import { useLanguage } from "../../hooks/useLanguage";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-col footer-brand">
          <Logo className="footer-logo" />
          <p>{t("footer.brandDescription")}</p>

          <h4 className="footer-follow-heading">{t("footer.followUs")}</h4>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
            <a href="#" className="footer-social-link" aria-label="Instagram"><i className="fab fa-instagram" /></a>
            <a href="#" className="footer-social-link" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
            <a href="#" className="footer-social-link" aria-label="Threads"><i className="fab fa-threads" /></a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{t("footer.supportService")}</h4>
          <p className="footer-contact">
            <i className="fas fa-phone" /> +994 12 424 24 24
          </p>
          <p className="footer-contact">
            <i className="fas fa-envelope" /> info@iticket.az
          </p>
        </div>

        <div className="footer-col">
          <h4>{t("footer.company")}</h4>
          <p><a href="#">{t("footer.aboutUs")}</a></p>
          <p><a href="#">{t("footer.artists")}</a></p>
          <p><a href="#">{t("footer.venues")}</a></p>
          <p><a href="#">{t("footer.ticketSalesPoints")}</a></p>
          <p><a href="#">{t("footer.ticketTypes")}</a></p>
        </div>

        <div className="footer-col">
          <h4>{t("footer.information")}</h4>
          <p><a href="#">{t("footer.faq")}</a></p>
          <p><a href="#">{t("footer.support")}</a></p>
          <p><a href="#">{t("footer.contact")}</a></p>
          <p><a href="#">{t("footer.ticketReturnExchange")}</a></p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{t("footer.copyright")}</span>
        <div className="footer-bottom-links">
          <span>{t("footer.termsAndConditions")}</span>
          <span>{t("footer.privacy")}</span>
        </div>
        <button type="button" className="footer-lang">
          <i className="fas fa-location-dot" />
          <span>{t("footer.azerbaijan")}</span>
          <i className="fas fa-chevron-down" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
