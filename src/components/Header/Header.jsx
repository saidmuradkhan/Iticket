import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import SearchBar from "./SearchBar";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const { unreadCount } = useContext(NotificationContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage, t } = useContext(LanguageContext);

  const toggleLanguage = () => {
    setLanguage(language === "az" ? "en" : "az");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        İticket.az
      </Link>

      <SearchBar />

      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Tema"
        >
          {theme === "light" ? "🌞" : "🌙"}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={toggleLanguage}
          aria-label="Dil"
        >
          {language === "az" ? "🇦🇿 AZ" : "🇬🇧 EN"}
        </button>

        <span className="notification-icon">
          🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </span>
        <Link to="/cart" className="cart-icon">
          🛒 {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
        </Link>
        {isAuthenticated ? (
          <Link to="/profile/account">{t("profile")}</Link>
        ) : (
          <Link to="/login">{t("login")}</Link>
        )}
      </div>
    </header>
  );
};

export default Header;
