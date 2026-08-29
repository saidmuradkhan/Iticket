import { useState, useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { useLanguage } from "../../hooks/useLanguage";

const TicketSelector = ({ event, onDone }) => {
  const { t } = useLanguage();
  const { addToCart } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});

  const changeQty = (ticketId, delta, available) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.min(Math.max(current + delta, 0), available);
      return { ...prev, [ticketId]: next };
    });
  };

  const totalCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  const handleAddToCart = () => {
    event.tickets.forEach((ticket) => {
      const qty = quantities[ticket.id] || 0;
      if (qty > 0) {
        addToCart({
          id: `${event.id}-${ticket.id}`,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          venue: event.venue,
          ticketLabel: ticket.label,
          price: ticket.price,
          quantity: qty,
        });
      }
    });
    onDone();
  };

  return (
    <div className="ticket-selector">
      <div className="stage-bar small">{t("ticketSelector.stage")}</div>
      <p className="free-seating-label">{t("ticketSelector.freeSeating")}</p>

      {event.tickets.map((ticket) => (
        <div className="ticket-selector-row" key={ticket.id}>
          <div>
            <p className="ticket-label">{ticket.label}</p>
            <p className="ticket-price">{ticket.price} ₼</p>
          </div>
          <div className="qty-stepper">
            <button type="button" onClick={() => changeQty(ticket.id, -1, ticket.available)} disabled={!quantities[ticket.id]}>
              −
            </button>
            <span>{quantities[ticket.id] || 0}</span>
            <button type="button" onClick={() => changeQty(ticket.id, 1, ticket.available)} disabled={(quantities[ticket.id] || 0) >= ticket.available}>
              +
            </button>
          </div>
        </div>
      ))}

      <button type="button" className="add-to-cart-btn" disabled={totalCount === 0} onClick={handleAddToCart}>
        {t("ticketSelector.addToCart")}
      </button>
    </div>
  );
};

export default TicketSelector;
