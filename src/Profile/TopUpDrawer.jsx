import { useEffect, useState } from "react";
import { startWalletTopUp } from "../api/payriff";
import { formatMoney } from "./profileHelpers";

const PRESETS = [5, 10, 20, 50, 100];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 5000;

const PayriffMark = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="3.5" width="18" height="13" rx="3" fill="#1F51FF" />
    <path d="M1 8h18" stroke="#fff" strokeWidth="1.6" />
    <rect x="4" y="11.5" width="5" height="1.8" rx="0.9" fill="#fff" />
  </svg>
);

const TopUpDrawer = ({ userId, onClose }) => {
  const [amount, setAmount] = useState("5");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const value = Number(amount);
  const isValid = Number.isFinite(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT;

  const submit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError(`Məbləğ ${MIN_AMOUNT}–${MAX_AMOUNT} ₼ aralığında olmalıdır`);
      return;
    }

    setPaying(true);
    setError("");
    try {
      const { paymentUrl } = await startWalletTopUp(userId, value);
      
      window.location.assign(paymentUrl);
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-label="Ödəniş prosesi"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-head">
          <h2>Ödəniş prosesi</h2>
          <button type="button" onClick={onClose} aria-label="Bağla">
            ✕
          </button>
        </header>

        <form className="drawer-body" onSubmit={submit}>
          <div className="drawer-section">
            <h3>Məbləğ</h3>
            <div className="topup-presets">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className={value === preset ? "active" : undefined}
                  onClick={() => {
                    setAmount(String(preset));
                    setError("");
                  }}
                >
                  {preset} ₼
                </button>
              ))}
            </div>

            <label className="topup-amount">
              Məbləği daxil edin
              <input
                type="number"
                inputMode="decimal"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
              />
            </label>
          </div>

          <div className="drawer-section">
            <h3>Ödəmə üsulu:</h3>
            <label className="topup-method active">
              <input type="radio" name="topup-method" defaultChecked readOnly />
              <span className="topup-method-dot" aria-hidden="true" />
              <PayriffMark />
              Payriff
            </label>
          </div>

          {error && <p className="payment-error">{error}</p>}

          <footer className="drawer-foot">
            <div className="topup-total">
              <span>Toplam məbləğ:</span>
              <strong>{isValid ? formatMoney(value) : "—"}</strong>
            </div>
            <p className="topup-note">
              * Cüzdana əlavə edilən məbləğ yalnız alışlar üçün istifadə oluna
              bilər və geri qaytarılmır.
            </p>
            <button type="submit" className="buy-btn" disabled={!isValid || paying}>
              {paying ? "Ödəniş səhifəsinə yönləndirilir..." : "Ödənişə keç"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
};

export default TopUpDrawer;
