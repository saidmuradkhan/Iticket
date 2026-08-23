import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../api/api";
import { startPayment } from "../../api/payriff";
import { useCountdown } from "../../hooks/useCountdown";
import Loader from "../../components/Loader/Loader";
import CountdownTimer from "../../components/CountdownTimer/CountdownTimer";
import PaymentMethods from "../../components/PaymentMethods/PaymentMethods";
import { CartContext } from "../../context/CartContext";

const Order = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    getOrderById(orderId).then((res) => {
      setOrder(res.data);
      setLoading(false);
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

    const res = await updateOrderStatus(orderId, "confirmed");
    setOrder(res.data);
    clearCart();
    setPaying(false);
  };

  const renderItems = () =>
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
        {order.payment?.transactionId && (
          <p className="event-detail-meta">
            Ödəniş kodu: {order.payment.transactionId}
          </p>
        )}
        <div className="order-items">{renderItems()}</div>
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
    <div className="order-page">
      <h1>Ödəniş</h1>
      <CountdownTimer minutes={minutes} seconds={seconds} isExpired={isExpired} />

      <div className="order-items">{renderItems()}</div>
      <p className="order-total">Cəmi: {order.totalPrice} ₼</p>

      {order.status === "declined" && (
        <p className="payment-error">Əvvəlki ödəniş rədd edildi. Yenidən cəhd edə bilərsiniz.</p>
      )}
      {order.status === "canceled" && (
        <p className="payment-error">Əvvəlki ödəniş ləğv edildi. Yenidən cəhd edə bilərsiniz.</p>
      )}

      <h2>Ödəniş üsulu</h2>
      <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />

      {payError && <p className="payment-error">{payError}</p>}

      <button
        type="button"
        className="buy-btn"
        disabled={!paymentMethod || paying}
        onClick={handlePay}
      >
        {paying
          ? isCardPayment
            ? "Ödəniş səhifəsinə yönləndirilir..."
            : "Ödənilir..."
          : "Ödə"}
      </button>
    </div>
  );
};

export default Order;
