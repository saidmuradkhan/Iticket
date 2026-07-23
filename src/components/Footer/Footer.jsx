const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-col footer-brand">
          <p className="footer-logo">İticket.az</p>
          <p>
            Onlayn və mərkəzləşdirilmiş bilet xidmətiniz. Bakıda və onun
            hüdudlarından kənarda keçirilən ən yaxşı tədbirlərdə sizinləyik!
          </p>
          <div className="footer-social">
            <i className="fab fa-facebook" />
            <i className="fab fa-instagram" />
            <i className="fab fa-tiktok" />
            <i className="fas fa-share-alt" />
            <i className="fab fa-linkedin" />
          </div>
        </div>

        <div className="footer-col">
          <h4>Dəstək xidməti</h4>
          <p>
            <i className="fas fa-phone" /> +994 12 424 24 24
          </p>
          <p>
            <i className="fas fa-envelope" /> info@iticket.az
          </p>
        </div>

        <div className="footer-col">
          <h4>Şirkət</h4>
          <p>Haqqımızda</p>
          <p>Sənətçilər</p>
          <p>Məkanlar</p>
          <p>Bilet Satış Məntəqələri</p>
          <p>Bilet növləri</p>
        </div>

        <div className="footer-col">
          <h4>Məlumat</h4>
          <p>Ən çox verilən suallar</p>
          <p>Dəstək</p>
          <p>Əlaqə</p>
          <p>Biletin qaytarılması və dəyişdirilməsi</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 iTicket - Final layihə</span>
        <div className="footer-bottom-links">
          <span>Şərtlər və Qaydalar</span>
          <span>Məxfilik</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
