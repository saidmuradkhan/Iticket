import { useState, useEffect, useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getWalletBalance } from "../api/payriff";
import { getWalletTransactions } from "../api/api";
import Loader from "../components/Loader/Loader";
import TopUpDrawer from "./TopUpDrawer";
import { ProfileNavIcon, PlusIcon } from "./ProfileIcons";
import { useLanguage } from "../hooks/useLanguage";
import { formatDateTime, formatMoney } from "./profileHelpers";

const TYPE_LABEL_KEYS = {
  topup: "wallet.typeTopup",
  purchase: "wallet.typePurchase",
  refund: "wallet.typeRefund",
};

const Wallet = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <h1>{t("wallet.title")}</h1>
      </div>

      <div className="wallet-card">
        <span className="wallet-card-label">
          <ProfileNavIcon name="wallet" />
          {t("wallet.balanceLabel")}
        </span>
        <strong className="wallet-card-balance">{balance === null ? "—" : formatMoney(balance)}</strong>
        <button type="button" className="primary-btn" onClick={() => setDrawerOpen(true)}>
          <PlusIcon />
          {t("wallet.topUp")}
        </button>
      </div>

      {error && <p className="payment-error">{error}</p>}

      <h2 className="profile-subheading">{t("wallet.transactionsTitle")}</h2>

      {loading ? (
        <Loader count={3} />
      ) : transactions.length === 0 ? (
        <p className="profile-empty">{t("wallet.empty")}</p>
      ) : (
        <div className="wallet-transactions">
          {transactions.map((item) => (
            <div className="wallet-transaction" key={item.id}>
              <div>
                <strong>
                  {TYPE_LABEL_KEYS[item.type]
                    ? t(TYPE_LABEL_KEYS[item.type])
                    : item.type}
                </strong>
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

      {drawerOpen && <TopUpDrawer userId={user.id} onClose={() => setDrawerOpen(false)} />}
    </div>
  );
};

export default Wallet;
