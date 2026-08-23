import { useState, useContext } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import { BellIcon } from "./HeaderIcons";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } =
    useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-bell">
      <button
        type="button"
        className="header-btn header-btn-icon"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Bildirişlər"
      >
        <span className="header-btn-icon-slot">
          <BellIcon />
        </span>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <>
          <div
            className="dropdown-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="notification-dropdown">
            {notifications.length === 0 ? (
              <p className="notification-empty">Bildiriş yoxdur</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={
                    n.read ? "notification-item" : "notification-item unread"
                  }
                  onClick={() => markAsRead(n.id)}
                >
                  <p className="notification-title">{n.title}</p>
                  <p className="notification-message">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
