import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../api/api";
import { startPayment, payWithWallet, getWalletBalance } from "../../api/payriff";
import { useCountdown } from "../../hooks/useCountdown";
import { MONTH_NAMES } from "../../utils/dateHelpers";
import Loader from "../../components/Loader/Loader";
import PaymentMethods from "../../components/PaymentMethods/PaymentMethods";
import { CartContext } from "../../context/CartContext";

const METHOD_LABELS = {
  online: "Onlayn",
  wallet: "Cüzdan",
  googlepay: "Google Pay",
  applepay: "Apple Pay",
};

const pad = (n) => String(n).padStart(2, "0");

const formatOrderDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    getOrderById(orderId).then((res) => {
      setOrder(res.data);
      setLoading(false);
      getWalletBalance(res.data.userId)
        .then((wallet) => setWalletBalance(wallet.balance))
        .catch(() => setWalletBalance(null));
    });
  }, [orderId]);

  const { minutes, seconds, isExpired } = useCountdown(order?.expiresAt);

  useEffect(() => {
    if (isExpired && order?.status === "pending_payment") {
      updateOrderStatus(orderId, "expired").then((res) => setOrder(res.data));
    }
  }, [isExpired, order, orderId]);

  if (loading) {
    return <Loader count={1} />;
  }

  if (!order) {
    return <div className="page">Sifariş tapılmadı.</div>;
  }
  const isCardPayment = ["online", "googlepay", "applepay"].includes(paymentMethod);
  const isWalletPayment = paymentMethod === "wallet";
  const walletShort = walletBalance !== null && walletBalance < order.totalPrice;
  const ticketCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handlePay = async () => {
    if (!paymentMethod) return;
    setPaying(true);
    setPayError(null);

    if (isCardPayment) {
      try {
        const { paymentUrl } = await startPayment(orderId);
        window.location.assign(paymentUrl);
      } catch (err) {
        setPayError(err.message);
        setPaying(false);
      }
      return;
    }

    if (isWalletPayment) {
      try {
        const { balance } = await payWithWallet(orderId);
        const res = await getOrderById(orderId);
        setOrder(res.data);
        setWalletBalance(balance);
        clearCart();
      } catch (err) {
        setPayError(err.message);
      }
      setPaying(false);
      return;
    }

    const res = await updateOrderStatus(orderId, "confirmed");
    setOrder(res.data);
    clearCart();
    setPaying(false);
  };

  const handleCancel = async () => {
    if (!window.confirm("Sifarişi ləğv etmək istədiyinizə əminsiniz?")) return;
    await updateOrderStatus(orderId, "canceled");
    navigate("/profile/orders");
  };

  const renderConfirmItems = () =>
    order.items.map((item, index) => (
      <div className="order-item" key={index}>
        <h3>{item.eventTitle}</h3>
        <p className="event-card-meta">{item.venue}</p>
        <p className="event-card-meta">
          {item.ticketLabel} × {item.quantity}
        </p>
        <p className="event-card-price">{item.price * item.quantity} ₼</p>
      </div>
    ));

  if (order.status === "confirmed") {
    return (
      <div className="order-page">
        <h1>Sifariş təsdiqləndi ✓</h1>
        <p className="event-detail-meta">
          Sifariş nömrəsi: #{order.id} · PIN: {order.pin}
        </p>
        {order.paymentMethod === "wallet" && (
          <p className="event-detail-meta">Ödəniş üsulu: Cüzdan</p>
        )}
        {order.payment?.transactionId && (
          <p className="event-detail-meta">
            Ödəniş kodu: {order.payment.transactionId}
          </p>
        )}
        <div className="order-items">{renderConfirmItems()}</div>
        <p className="order-total">Cəmi: {order.totalPrice} ₼</p>
      </div>
    );
  }

  if (order.status === "expired") {
    return (
      <div className="page">
        <p>Ödəniş vaxtı bitdi, sifariş ləğv olundu.</p>
        <button type="button" className="buy-btn" onClick={() => navigate("/")}>
          Ana səhifəyə qayıt
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-topbar">
        <div className="order-breadcrumb">
          <button type="button" className="link-muted" onClick={() => navigate("/profile/orders")}>
            Sifarişlər
          </button>
          <i className="fas fa-chevron-right" />
          <span>#{order.id}</span>
        </div>
        <span className={isExpired ? "hold-timer expired" : "hold-timer"}>
          <i className="fas fa-clock" />{" "}
          {isExpired ? "Vaxt bitdi" : `Qalan vaxt: ${pad(minutes)}:${pad(seconds)}`}
        </span>
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          <div className="panel">
            <h2 className="panel-title">Ödəmə üsulu</h2>

            {order.status === "declined" && (
              <p className="payment-error">Əvvəlki ödəniş rədd edildi. Yenidən cəhd edə bilərsiniz.</p>
            )}
            {order.status === "canceled" && (
              <p className="payment-error">Əvvəlki ödəniş ləğv edildi. Yenidən cəhd edə bilərsiniz.</p>
            )}

            <PaymentMethods
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              walletBalance={walletBalance}
              walletDisabled={walletShort}
            />

            {payError && <p className="payment-error">{payError}</p>}
          </div>

          <button type="button" className="link-danger" onClick={handleCancel}>
            Sifarişi ləğv et
          </button>
        </div>

        <aside className="checkout-summary panel">
          <div className="summary-row">
            <span className="summary-label">Status</span>
            <span className="status-badge">
              <i className="fas fa-hourglass-half" /> Ödəniş gözlənilir...
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Sifariş №</span>
            <b>#{order.id}</b>
          </div>
          <div className="summary-row">
            <span className="summary-label">PIN</span>
            <b>{order.pin}</b>
          </div>
          <div className="summary-row">
            <span className="summary-label">Tarix</span>
            <b>{formatOrderDate(order.createdAt)}</b>
          </div>
          <div className="summary-row">
            <span className="summary-label">Ödəmə üsulu</span>
            <b>{paymentMethod ? METHOD_LABELS[paymentMethod] : "—"}</b>
          </div>

          <div className="summary-divider" />

          <div className="summary-tickets-head">
            <i className="fas fa-ticket-alt" /> Biletlər ({ticketCount})
          </div>
          <div className="summary-ticket-list">
            {order.items.map((item, index) => (
              <p key={index} className="summary-ticket-line">
                {item.eventTitle}
                <span>{item.ticketLabel}</span>
              </p>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span className="summary-label">Bilet × {ticketCount}</span>
            <span>{order.totalPrice} ₼</span>
          </div>
          <div className="summary-total">
            <span>Toplam qiymət</span>
            <span>{order.totalPrice} ₼</span>
          </div>

          <button
            type="button"
            className="buy-btn checkout-submit"
            disabled={!paymentMethod || paying}
            onClick={handlePay}
          >
            {paying
              ? isCardPayment
                ? "Yönləndirilir..."
                : "Ödənilir..."
              : "Ödə"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Order;
