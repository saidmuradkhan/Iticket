import { useState, useEffect, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyPayment, verifyWalletTopUp } from "../../api/payriff";
import { CartContext } from "../../context/CartContext";
import { useLanguage } from "../../hooks/useLanguage";
import Loader from "../../components/Loader/Loader";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY = 1500;

const MESSAGES = {
  confirmed: { title: "paymentResult.orderConfirmedTitle", text: "paymentResult.orderConfirmedText" },
  declined: { title: "paymentResult.orderDeclinedTitle", text: "paymentResult.orderDeclinedText" },
  canceled: { title: "paymentResult.orderCanceledTitle", text: "paymentResult.orderCanceledText" },
  expired: { title: "paymentResult.orderExpiredTitle", text: "paymentResult.orderExpiredText" },
  refunded: { title: "paymentResult.refundedTitle", text: "paymentResult.refundedText" },
  pending_payment: { title: "paymentResult.pendingTitle", text: "paymentResult.pendingText" },
};

const TOPUP_MESSAGES = {
  confirmed: { title: "paymentResult.topupConfirmedTitle", text: "paymentResult.topupConfirmedText" },
  declined: { title: "paymentResult.topupDeclinedTitle", text: "paymentResult.topupDeclinedText" },
  canceled: { title: "paymentResult.topupCanceledTitle", text: "paymentResult.topupCanceledText" },
  expired: { title: "paymentResult.topupExpiredTitle", text: "paymentResult.topupExpiredText" },
  refunded: { title: "paymentResult.refundedTitle", text: "paymentResult.refundedText" },
  pending_payment: { title: "paymentResult.pendingTitle", text: "paymentResult.pendingText" },
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const topupRef = searchParams.get("topupRef");
  const isTopUp = !!topupRef;
  const { clearCart } = useContext(CartContext);
  const { t } = useLanguage();

  const [state, setState] = useState(() =>
    orderId || topupRef
      ? { phase: "loading" }
      : { phase: "error", message: t("paymentResult.noPaymentInfo") }
  );

  useEffect(() => {
    if (!orderId && !topupRef) return;

    let cancelled = false;
    let timer;

    const check = async (attempt) => {
      try {
        const data = topupRef
          ? await verifyWalletTopUp(topupRef)
          : await verifyPayment(orderId);
        if (cancelled) return;

        if (data.status === "pending_payment" && attempt < MAX_ATTEMPTS) {
          timer = setTimeout(() => check(attempt + 1), RETRY_DELAY);
          return;
        }

        if (data.status === "confirmed" && !topupRef) clearCart();

        setState({ phase: "done", status: data.status, amount: data.amount, balance: data.balance });
      } catch (err) {
        if (cancelled) return;
        setState({ phase: "error", message: err.message });
      }
    };

    check(1);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, topupRef, clearCart]);

  if (state.phase === "loading") {
    return (
      <div className="payment-result">
        <h1>{t("paymentResult.verifying")}</h1>
        <Loader count={1} />
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="payment-result failed">
        <h1>{t("paymentResult.errorTitle")}</h1>
        <p className="event-detail-meta">{state.message}</p>
        <div className="payment-result-actions">
          <Link className="buy-btn" to={isTopUp ? "/profile/wallet" : "/"}>
            {isTopUp ? t("paymentResult.backToWallet") : t("paymentResult.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  const messages = isTopUp ? TOPUP_MESSAGES : MESSAGES;
  const message = messages[state.status] || messages.pending_payment;
  const isSuccess = state.status === "confirmed";

  if (isTopUp) {
    return (
      <div className={isSuccess ? "payment-result success" : "payment-result failed"}>
        <h1>{t(message.title)}</h1>
        <p className="event-detail-meta">{t(message.text)}</p>
        {isSuccess && state.balance !== undefined && (
          <p className="event-detail-meta">
            {t("paymentResult.newBalance", { amount: Number(state.balance).toFixed(2) })}
          </p>
        )}

        <div className="payment-result-actions">
          <Link className="buy-btn" to="/profile/wallet">
            {t("paymentResult.goToWallet")}
          </Link>
          {!isSuccess && (
            <Link className="payment-result-link" to="/">
              {t("paymentResult.home")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={isSuccess ? "payment-result success" : "payment-result failed"}>
      <h1>{t(message.title)}</h1>
      <p className="event-detail-meta">{t(message.text)}</p>

      <div className="payment-result-actions">
        {isSuccess ? (
          <>
            <Link className="buy-btn" to={`/profile/orders/${orderId}`}>
              {t("paymentResult.viewOrder")}
            </Link>
            <Link className="payment-result-link" to="/profile/tickets">
              {t("paymentResult.myTickets")}
            </Link>
          </>
        ) : (
          <>
            <Link className="buy-btn" to={`/profile/orders/${orderId}`}>
              {t("paymentResult.tryAgain")}
            </Link>
            <Link className="payment-result-link" to="/">
              {t("paymentResult.home")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
