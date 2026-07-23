import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../api/api";
import Loader from "../components/Loader/Loader";
import { formatEventDate } from "../utils/dateHelpers";

const STATUS_LABELS = {
  pending_payment: "Ödəniş gözlənilir",
  confirmed: "Təsdiqləndi",
  expired: "Ləğv olundu",
};

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(user.id).then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) {
    return <Loader count={3} />;
  }

  if (orders.length === 0) {
    return <p>Hələ heç bir sifarişiniz yoxdur.</p>;
  }

  return (
    <div className="orders-list">
      <h1>Sifarişlər</h1>
      {orders.map((order) => (
        <div className="order-summary-card" key={order.id}>
          <div className="order-summary-header">
            <span>#{order.id}</span>
            <span className={`status-badge ${order.status}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          {order.items.map((item, i) => {
            const dateLabel = isNaN(new Date(item.eventDate))
              ? item.eventDate
              : formatEventDate(item.eventDate);
            return (
              <p className="event-card-meta" key={i}>
                {item.eventTitle} · {dateLabel} · {item.ticketLabel} ×{" "}
                {item.quantity}
              </p>
            );
          })}
          <p className="event-card-price">{order.totalPrice} ₼</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
