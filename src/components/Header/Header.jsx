import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage, t } = useContext(LanguageContext);

  const toggleLanguage = () => {
    setLanguage(language === "az" ? "en" : "az");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        iTicket<span className="logo-accent">.AZ</span>
      </Link>

      <SearchBar />

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Tema"
        >
          <i className={theme === "light" ? "fas fa-sun" : "fas fa-moon"} />
        </button>

        <button
          type="button"
          className="icon-btn lang-btn"
          onClick={toggleLanguage}
          aria-label="Dil"
        >
          <i className="fas fa-globe" /> {language === "az" ? "AZ" : "EN"}
        </button>

        <NotificationBell />
        <Link to="/cart" className="icon-btn cart-icon" aria-label="Səbət">
          <i className="fas fa-shopping-cart" />
          {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
        </Link>
        {isAuthenticated ? (
          <Link to="/profile/account" className="header-link">
            <i className="fas fa-user" /> {t("profile")}
          </Link>
        ) : (
          <Link to="/login" className="header-link">
            {t("login")}
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
