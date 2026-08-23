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
            <a href="#" className="footer-social-link"><i className="fab fa-facebook-f" /></a>
            <a href="#" className="footer-social-link"><i className="fab fa-instagram" /></a>
            <a href="#" className="footer-social-link"><i className="fab fa-tiktok" /></a>
            <a href="#" className="footer-social-link"><i className="fab fa-twitter" /></a>
            <a href="#" className="footer-social-link"><i className="fab fa-linkedin-in" /></a>
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

      <div className="footer-payment" style={{maxWidth: 1200, margin: '24px auto 0'}}>
        <div className="footer-payment-icon"><i className="fab fa-cc-visa" /></div>
        <div className="footer-payment-icon"><i className="fab fa-cc-mastercard" /></div>
        <div className="footer-payment-icon"><i className="fab fa-cc-amex" /></div>
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
