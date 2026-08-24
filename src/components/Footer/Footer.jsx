import Logo from "../Logo/Logo";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-col footer-brand">
          <Logo className="footer-logo" />
          <p>
            Onlayn və mərkəzləşdirilmiş bilet xidmətiniz. Bakıda və onun
            hüdudlarından kənarda keçirilən ən yaxşı tədbirlərdə sizinləyik!
          </p>

          <h4 className="footer-follow-heading">Bizi izləyin</h4>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
            <a href="#" className="footer-social-link" aria-label="Instagram"><i className="fab fa-instagram" /></a>
            <a href="#" className="footer-social-link" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
            <a href="#" className="footer-social-link" aria-label="Threads"><i className="fab fa-threads" /></a>
            <a href="#" className="footer-social-link" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Dəstək xidməti</h4>
          <p className="footer-contact">
            <i className="fas fa-phone" /> +994 12 424 24 24
          </p>
          <p className="footer-contact">
            <i className="fas fa-envelope" /> info@iticket.az
          </p>
        </div>

        <div className="footer-col">
          <h4>Şirkət</h4>
          <p><a href="#">Haqqımızda</a></p>
          <p><a href="#">Sənətçilər</a></p>
          <p><a href="#">Məkanlar</a></p>
          <p><a href="#">Bilet Satış Məntəqələri</a></p>
          <p><a href="#">Bilet növləri</a></p>
        </div>

        <div className="footer-col">
          <h4>Məlumat</h4>
          <p><a href="#">Ən çox verilən suallar</a></p>
          <p><a href="#">Dəstək</a></p>
          <p><a href="#">Əlaqə</a></p>
          <p><a href="#">Biletin qaytarılması və dəyişdirilməsi</a></p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2016–2026 iTicket.GLOBAL. Bütün hüquqlar qorunur.</span>
        <div className="footer-bottom-links">
          <span>Şərtlər və Qaydalar</span>
          <span>Məxfilik</span>
        </div>
        <button type="button" className="footer-lang">
          <i className="fas fa-location-dot" />
          <span>Azərbaycan</span>
          <i className="fas fa-chevron-down" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
