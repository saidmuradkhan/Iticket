import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";
import { AuthContext } from "../../context/AuthContext";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const { unreadCount } = useContext(NotificationContext);
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <header className="header">
      <Link to="/" className="logo">
        i:ticket.az
      </Link>

      <nav className="main-nav">
        <Link to="/">Bütün tədbirlər</Link>
        <Link to="/events">Konsert</Link>
        <Link to="/shows">Tamaşa</Link>
      </nav>

      <div className="header-actions">
        <span className="notification-icon">
          🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </span>
        <Link to="/cart" className="cart-icon">
          🛒 {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
        </Link>
        {isAuthenticated ? (
          <Link to="/profile/account">Profil</Link>
        ) : (
          <Link to="/login">Giriş</Link>
        )}
      </div>
    </header>
  );
};

export default Header;
