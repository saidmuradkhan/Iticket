import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../api/api";
import { startPayment, payWithWallet, getWalletBalance } from "../../api/payriff";
import { useCountdown } from "../../hooks/useCountdown";
import { useLanguage } from "../../hooks/useLanguage";
import { getMonthNames } from "../../utils/dateHelpers";
import Loader from "../../components/Loader/Loader";
import PaymentMethods from "../../components/PaymentMethods/PaymentMethods";
import { CartContext } from "../../context/CartContext";

const METHOD_LABELS = {
  online: "order.methodOnline",
  wallet: "order.methodWallet",
  googlepay: "order.methodGooglePay",
  applepay: "order.methodApplePay",
};

const pad = (n) => String(n).padStart(2, "0");

const formatOrderDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${getMonthNames()[d.getMonth()]} ${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const { t } = useLanguage();

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
    return <div className="page">{t("order.notFound")}</div>;
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
    if (!window.confirm(t("order.cancelConfirm"))) return;
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
        <h1>{t("order.confirmedTitle")}</h1>
        <p className="event-detail-meta">
          {t("order.orderNumber")}: #{order.id} · PIN: {order.pin}
        </p>
        {order.paymentMethod === "wallet" && (
          <p className="event-detail-meta">{t("order.paymentMethodWallet")}</p>
        )}
        {order.payment?.transactionId && (
          <p className="event-detail-meta">
            {t("order.paymentCode")}: {order.payment.transactionId}
          </p>
        )}
        <div className="order-items">{renderConfirmItems()}</div>
        <p className="order-total">{t("order.total")}: {order.totalPrice} ₼</p>
      </div>
    );
  }

  if (order.status === "expired") {
    return (
      <div className="page">
        <p>{t("order.expiredText")}</p>
        <button type="button" className="buy-btn" onClick={() => navigate("/")}>
          {t("order.backToHome")}
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-topbar">
        <div className="order-breadcrumb">
          <button type="button" className="link-muted" onClick={() => navigate("/profile/orders")}>
            {t("order.orders")}
          </button>
          <i className="fas fa-chevron-right" />
          <span>#{order.id}</span>
        </div>
        <span className={isExpired ? "hold-timer expired" : "hold-timer"}>
          <i className="fas fa-clock" />{" "}
          {isExpired ? t("order.timeUp") : t("order.timeLeft", { time: `${pad(minutes)}:${pad(seconds)}` })}
        </span>
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          <div className="panel">
            <h2 className="panel-title">{t("order.paymentMethod")}</h2>

            {order.status === "declined" && (
              <p className="payment-error">{t("order.prevDeclined")}</p>
            )}
            {order.status === "canceled" && (
              <p className="payment-error">{t("order.prevCanceled")}</p>
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
            {t("order.cancelOrder")}
          </button>
        </div>

        <aside className="checkout-summary panel">
          <div className="summary-row">
            <span className="summary-label">{t("order.status")}</span>
            <span className="status-badge">
              <i className="fas fa-hourglass-half" /> {t("order.awaitingPayment")}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t("order.orderNo")}</span>
            <b>#{order.id}</b>
          </div>
          <div className="summary-row">
            <span className="summary-label">PIN</span>
            <b>{order.pin}</b>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t("order.date")}</span>
            <b>{formatOrderDate(order.createdAt)}</b>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t("order.paymentMethod")}</span>
            <b>{paymentMethod ? t(METHOD_LABELS[paymentMethod]) : "—"}</b>
          </div>

          <div className="summary-divider" />

          <div className="summary-tickets-head">
            <i className="fas fa-ticket-alt" /> {t("order.ticketsCount", { count: ticketCount })}
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
            <span className="summary-label">{t("order.ticketMultiply", { count: ticketCount })}</span>
            <span>{order.totalPrice} ₼</span>
          </div>
          <div className="summary-total">
            <span>{t("order.totalPrice")}</span>
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
                ? t("order.redirecting")
                : t("order.paying")
              : t("order.pay")}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Order;
