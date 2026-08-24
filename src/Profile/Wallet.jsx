import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getWalletBalance } from "../api/payriff";
import { getWalletTransactions } from "../api/api";
import Loader from "../components/Loader/Loader";
import TopUpDrawer from "./TopUpDrawer";
import { ProfileNavIcon, PlusIcon } from "./ProfileIcons";
import { formatDateTime, formatMoney } from "./profileHelpers";

const TYPE_LABELS = {
  topup: "Balans artırıldı",
  purchase: "Alış",
  refund: "Geri qaytarma",
};

const Wallet = () => {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // balans ödəniş serverindən gəlir - artırma yalnız orada baş verir
  const load = useCallback(
    () =>
      Promise.all([getWalletBalance(user.id), getWalletTransactions(user.id)])
        .then(([wallet, history]) => {
          setBalance(wallet.balance);
          setTransactions(history.data);
          setError("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false)),
    [user.id]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Cüzdan</h1>
      </div>

      <div className="wallet-card">
        <span className="wallet-card-label">
          <ProfileNavIcon name="wallet" />
          Cüzdan balansı
        </span>
        <strong className="wallet-card-balance">
          {balance === null ? "—" : formatMoney(balance)}
        </strong>
        <button
          type="button"
          className="primary-btn"
          onClick={() => setDrawerOpen(true)}
        >
          <PlusIcon />
          Balansı artır
        </button>
      </div>

      {error && <p className="payment-error">{error}</p>}

      <h2 className="profile-subheading">Balans əməliyyatları</h2>

      {loading ? (
        <Loader count={3} />
      ) : transactions.length === 0 ? (
        <p className="profile-empty">Hesabınızda tranzaksiya yoxdur.</p>
      ) : (
        <div className="wallet-transactions">
          {transactions.map((item) => (
            <div className="wallet-transaction" key={item.id}>
              <div>
                <strong>{TYPE_LABELS[item.type] || item.type}</strong>
                <p className="event-card-meta">
                  {formatDateTime(item.createdAt)}
                  {item.orderId && ` · #${item.orderId}`}
                </p>
              </div>
              <span
                className={
                  item.amount < 0
                    ? "wallet-transaction-amount negative"
                    : "wallet-transaction-amount positive"
                }
              >
                {item.amount < 0 ? "−" : "+"}
                {formatMoney(Math.abs(item.amount))}
              </span>
            </div>
          ))}
        </div>
      )}

      {drawerOpen && (
        <TopUpDrawer userId={user.id} onClose={() => setDrawerOpen(false)} />
      )}
    </div>
  );
};

export default Wallet;
