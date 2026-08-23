import { useState, useEffect, useContext } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyPayment, verifyWalletTopUp } from "../../api/payriff";
import { CartContext } from "../../context/CartContext";
import Loader from "../../components/Loader/Loader";

const MAX_ATTEMPTS = 4;
const RETRY_DELAY = 1500;

const MESSAGES = {
  confirmed: { title: "Ödəniş tamamlandı ✓", text: "Biletləriniz hesabınıza əlavə olundu." },
  declined: { title: "Ödəniş rədd edildi", text: "Kart ödənişi bank tərəfindən qəbul olunmadı." },
  canceled: { title: "Ödəniş ləğv edildi", text: "Ödəniş prosesi yarımçıq qaldı." },
  expired: { title: "Ödəniş vaxtı bitdi", text: "Sifariş ləğv olundu, yenidən cəhd edin." },
  refunded: { title: "Ödəniş geri qaytarıldı", text: "Məbləğ kartınıza qaytarılıb." },
  pending_payment: { title: "Ödəniş təsdiqlənmədi", text: "Ödəniş hələ tamamlanmayıb." },
};

// cüzdan balansının artırılması üçün mətnlər
const TOPUP_MESSAGES = {
  confirmed: { title: "Balans artırıldı ✓", text: "Məbləğ cüzdanınıza əlavə olundu." },
  declined: { title: "Ödəniş rədd edildi", text: "Balans artırılmadı, kart ödənişi qəbul olunmadı." },
  canceled: { title: "Ödəniş ləğv edildi", text: "Balans artırılmadı." },
  expired: { title: "Ödəniş vaxtı bitdi", text: "Balans artırılmadı, yenidən cəhd edin." },
  refunded: { title: "Ödəniş geri qaytarıldı", text: "Məbləğ kartınıza qaytarılıb." },
  pending_payment: { title: "Ödəniş təsdiqlənmədi", text: "Ödəniş hələ tamamlanmayıb." },
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const topupRef = searchParams.get("topupRef");
  const isTopUp = !!topupRef;
  const { clearCart } = useContext(CartContext);

  const [state, setState] = useState(() =>
    orderId || topupRef
      ? { phase: "loading" }
      : { phase: "error", message: "Ödəniş məlumatı tapılmadı" }
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
        <h1>Ödəniş yoxlanılır...</h1>
        <Loader count={1} />
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="payment-result failed">
        <h1>Xəta baş verdi</h1>
        <p className="event-detail-meta">{state.message}</p>
        <div className="payment-result-actions">
          <Link className="buy-btn" to={isTopUp ? "/profile/wallet" : "/"}>
            {isTopUp ? "Cüzdana qayıt" : "Ana səhifəyə qayıt"}
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
        <h1>{message.title}</h1>
        <p className="event-detail-meta">{message.text}</p>
        {isSuccess && state.balance !== undefined && (
          <p className="event-detail-meta">
            Yeni balans: {Number(state.balance).toFixed(2)} ₼
          </p>
        )}

        <div className="payment-result-actions">
          <Link className="buy-btn" to="/profile/wallet">
            Cüzdana keç
          </Link>
          {!isSuccess && (
            <Link className="payment-result-link" to="/">
              Ana səhifə
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={isSuccess ? "payment-result success" : "payment-result failed"}>
      <h1>{message.title}</h1>
      <p className="event-detail-meta">{message.text}</p>

      <div className="payment-result-actions">
        {isSuccess ? (
          <>
            <Link className="buy-btn" to={`/order/${orderId}`}>
              Sifarişə bax
            </Link>
            <Link className="payment-result-link" to="/profile/tickets">
              Biletlərim
            </Link>
          </>
        ) : (
          <>
            <Link className="buy-btn" to={`/order/${orderId}`}>
              Yenidən cəhd et
            </Link>
            <Link className="payment-result-link" to="/">
              Ana səhifə
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
