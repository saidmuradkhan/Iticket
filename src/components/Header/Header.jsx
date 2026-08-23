import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import { SunIcon, MoonIcon, FlagAzIcon, FlagEnIcon, CartIcon, } from "./HeaderIcons";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LanguageContext);

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
          className="header-btn header-btn-icon"
          onClick={toggleTheme}
          aria-label="Tema dəyiş"
        >
          <span className="header-btn-icon-slot">
            {theme === "light" ? <SunIcon /> : <MoonIcon />}
          </span>
        </button>

        <button
          type="button"
          className="header-btn header-btn-icon"
          onClick={toggleLanguage}
          aria-label={`Dil: ${language.toUpperCase()}`}
        >
          <span className="header-btn-icon-slot header-flag">
            {language === "az" ? <FlagAzIcon /> : <FlagEnIcon />}
          </span>
        </button>

        <NotificationBell />

        <Link
          to="/cart"
          className="header-btn header-btn-icon cart-icon"
          aria-label="Səbət"
        >
          <span className="header-btn-icon-slot">
            <CartIcon />
          </span>
          {cartItems.length > 0 && (
            <span className="badge">{cartItems.length}</span>
          )}
        </Link>

        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
