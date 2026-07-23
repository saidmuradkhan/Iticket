import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { createOrder } from "../../api/api";
import { formatEventDate } from "../../utils/dateHelpers";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const order = {
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      userId: user?.id || null,
      items: cartItems.map((item) => ({
        eventId: item.eventId,
        eventTitle: item.eventTitle,
        eventDate: item.eventDate,
        venue: item.venue,
        ticketLabel: item.ticketLabel,
        seatInfo: item.seatInfo || null,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    // json-server sifarişə öz id-sini verir, ona görə cavabdan oxuyuruq
    const res = await createOrder(order);
    navigate(`/order/${res.data.id}`);
  };

  if (cartItems.length === 0) {
    return <div className="page">Səbətiniz boşdur.</div>;
  }

  return (
    <div className="cart-page">
      <h1>Səbət</h1>

      <div className="cart-list">
        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <div>
              <h3>{item.eventTitle}</h3>
              <p className="event-card-meta">
                {formatEventDate(item.eventDate)} · {item.venue}
              </p>
              <p className="event-card-meta">{item.ticketLabel}</p>
            </div>

            <div className="cart-item-actions">
              {item.seatInfo ? (<span className="cart-item-qty-label">{item.quantity} ədəd</span>) : (
                <div className="qty-stepper">
                  <button type="button" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, 1)}>
                    +
                  </button>
                </div>
              )}
              <p className="event-card-price">{item.price * item.quantity} ₼</p>
              <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <span>Cəmi: {totalPrice} ₼</span>
        <button type="button" className="buy-btn" onClick={handleCheckout}>
          Ödənişə keç
        </button>
      </div>
    </div>
  );
};

export default Cart;
