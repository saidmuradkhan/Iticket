import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { createOrder } from "../../api/api";
import { useCountdown } from "../../hooks/useCountdown";

const pad = (n) => String(n).padStart(2, "0");

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg] = useState(null);
  const [creating, setCreating] = useState(false);

  // Səbətdəki biletlərin saxlanma vaxtı — ilk əlavədə localStorage-a yazılır, reload-da qorunur
  const [holdExpiresAt] = useState(() => {
    if (cartItems.length === 0) return null;
    const stored = localStorage.getItem("cartHoldExpiresAt");
    if (stored) return stored;
    const deadline = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    localStorage.setItem("cartHoldExpiresAt", deadline);
    return deadline;
  });

  const { minutes, seconds, isExpired } = useCountdown(holdExpiresAt);

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoMsg("Belə promokod tapılmadı");
  };

  const handleCreateOrder = async () => {
    if (!agreed || creating) return;
    setCreating(true);
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

    try {
      const res = await createOrder(order);
      localStorage.removeItem("cartHoldExpiresAt");
      navigate(`/profile/orders/${res.data.id}`);
    } catch {
      setCreating(false);
    }
  };

  if (cartItems.length === 0) {
    return <div className="page">Səbətiniz boşdur.</div>;
  }

  const ticketCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="checkout-page">
      <div className="checkout-topbar">
        <button type="button" className="checkout-back" onClick={() => navigate(-1)} aria-label="Geri">
          <i className="fas fa-chevron-left" />
        </button>
        <span className={isExpired ? "hold-timer expired" : "hold-timer"}>
          <i className="fas fa-clock" />{" "}
          {isExpired ? "Vaxt bitdi" : `Qalan vaxt: ${pad(minutes)}:${pad(seconds)}`}
        </span>
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          <div className="checkout-user panel">
            <div>
              <h3>{user?.name || "Qonaq istifadəçi"}</h3>
              <p className="checkout-user-contact">
                {user?.phone && <span>{user.phone}</span>}
                {user?.phone && user?.email && <span className="dot">·</span>}
                {user?.email && <span>{user.email}</span>}
              </p>
            </div>
            <button type="button" className="icon-btn" aria-label="Redaktə et">
              <i className="fas fa-pen" />
            </button>
          </div>

          <div className="checkout-tickets panel">
            <div className="panel-head">
              <h2>
                Biletlər <span className="count-badge">{ticketCount}</span>
              </h2>
              <button type="button" className="link-muted" onClick={clearCart}>
                Səbəti təmizlə
              </button>
            </div>

            <div className="checkout-ticket-list">
              {cartItems.map((item) => (
                <div className="checkout-ticket" key={item.id}>
                  <div className="checkout-ticket-info">
                    <h4>{item.eventTitle}</h4>
                    <p className="checkout-ticket-date">
                      {formatDateTime(item.eventDate)}
                      {item.venue && ` · ${item.venue}`}
                    </p>
                    <p className="checkout-ticket-seat">{item.ticketLabel}</p>
                  </div>
                  <div className="checkout-ticket-side">
                    {!item.seatInfo && (
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
                    <span className="checkout-ticket-price">{item.price * item.quantity} ₼</span>
                    <button type="button" className="icon-btn remove" onClick={() => removeFromCart(item.id)} aria-label="Sil">
                      <i className="fas fa-times" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="checkout-summary panel">
          <div className="summary-block">
            <button type="button" className="promo-toggle" onClick={() => setPromoOpen((v) => !v)}>
              <span>
                <i className="fas fa-tag" /> Promokodun var?
              </span>
              <i className={promoOpen ? "fas fa-chevron-up" : "fas fa-chevron-down"} />
            </button>
            {promoOpen && (
              <div className="promo-body">
                <div className="promo-input-row">
                  <input
                    type="text"
                    placeholder="Promokod"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoMsg(null);
                    }}
                  />
                  <button type="button" onClick={applyPromo}>
                    Tətbiq et
                  </button>
                </div>
                {promoMsg && <p className="promo-msg">{promoMsg}</p>}
              </div>
            )}
          </div>

          <div className="summary-divider" />

          <div className="summary-block">
            <h4 className="summary-label">Çatdırılma üsulu</h4>
            <p className="summary-delivery">
              <i className="fas fa-ticket-alt" /> Elektron bilet və ya vauçer
            </p>
          </div>

          <div className="summary-divider" />

          <div className="summary-block">
            <h4 className="summary-label">Sifariş yekunu</h4>
            <div className="summary-row">
              <span>Biletlər ({ticketCount})</span>
              <span>{totalPrice} ₼</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Toplam qiymət</span>
            <span>{totalPrice} ₼</span>
          </div>

          <label className="terms-check">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              <strong>iTicket</strong>-in şərtlər və qaydaları ilə tanış oldum və razıyam.
            </span>
          </label>

          <button
            type="button"
            className="buy-btn checkout-submit"
            disabled={!agreed || creating}
            onClick={handleCreateOrder}
          >
            {creating ? "Yaradılır..." : "Sifariş yarat"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
