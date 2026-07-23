import { createContext, useState, useEffect } from "react";
import { getNotifications, markNotificationRead } from "../api/api";

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then((res) => setNotifications(res.data));
  }, []);

  const markAsRead = (id) => {
    markNotificationRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
