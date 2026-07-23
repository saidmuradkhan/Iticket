import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../api/api";
import Loader from "../components/Loader/Loader";
import { formatEventDate } from "../utils/dateHelpers";

const Tickets = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(user.id).then((res) => {
      const confirmed = res.data.filter((order) => order.status === "confirmed");
      const items = confirmed.flatMap((order) =>
        order.items.map((item) => ({ ...item, orderId: order.id }))
      );
      setTickets(items);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) {
    return <Loader count={3} />;
  }

  if (tickets.length === 0) {
    return <p>Hələ təsdiqlənmiş biletiniz yoxdur.</p>;
  }

  return (
    <div className="tickets-list">
      <h1>Biletlər</h1>
      {tickets.map((item, i) => {
        const dateLabel = isNaN(new Date(item.eventDate))
          ? item.eventDate
          : formatEventDate(item.eventDate);
        return (
          <div className="order-summary-card" key={i}>
            <h3>{item.eventTitle}</h3>
            <p className="event-card-meta">
              {dateLabel} · {item.venue}
            </p>
            <p className="event-card-meta">
              {item.ticketLabel} × {item.quantity}
            </p>
            <p className="event-card-price">{item.price * item.quantity} ₼</p>
          </div>
        );
      })}
    </div>
  );
};

export default Tickets;
