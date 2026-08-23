import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../api/api";
import Loader from "../components/Loader/Loader";
import Modal from "../components/Modal/Modal";
import { formatDateTime, formatMoney } from "./profileHelpers";

const REASONS = [
  "Tədbirə gedə bilmirəm",
  "Səhv bilet almışam",
  "Tədbir təxirə salındı",
  "Digər",
];

const RefundRequests = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ orderId: "", reason: REASONS[0] });

  useEffect(() => {
    getOrders(user.id).then((res) => {
      setOrders(res.data.filter((order) => order.status === "confirmed"));
      setLoading(false);
    });
  }, [user.id]);

  const submit = (e) => {
    e.preventDefault();
    const order = orders.find((o) => String(o.id) === draft.orderId);
    if (!order) return;

    setRequests((prev) => [
      {
        id: `RF-${order.id}`,
        orderId: order.id,
        amount: order.totalPrice,
        reason: draft.reason,
        createdAt: new Date().toISOString(),
        status: "Baxılır",
      },
      ...prev,
    ]);
    setFormOpen(false);
    setDraft({ orderId: "", reason: REASONS[0] });
  };

  if (loading) return <Loader count={3} />;

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Qaytarma sorğuları</h1>
        <button
          type="button"
          className="primary-btn"
          onClick={() => setFormOpen(true)}
          disabled={orders.length === 0}
        >
          Yeni sorğu
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="profile-empty profile-empty-narrow">
          {orders.length === 0
            ? "Qaytarma sorğusu göndərmək üçün tamamlanmış sifarişiniz yoxdur."
            : "Hələ qaytarma sorğunuz yoxdur. Tamamlanmış sifarişiniz üçün sorğu göndərə bilərsiniz."}
        </p>
      ) : (
        <div className="orders-list">
          {requests.map((request) => (
            <div className="order-summary-card" key={request.id}>
              <div className="order-summary-header">
                <span>#{request.orderId}</span>
                <span className="status-badge">{request.status}</span>
              </div>
              <p className="event-card-meta">{request.reason}</p>
              <p className="event-card-meta">
                {formatDateTime(request.createdAt)}
              </p>
              <p className="event-card-price">{formatMoney(request.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <Modal onClose={() => setFormOpen(false)}>
          <h2>Yeni qaytarma sorğusu</h2>
          <form className="profile-form" onSubmit={submit}>
            <label>
              Sifariş
              <select
                value={draft.orderId}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, orderId: e.target.value }))
                }
                required
              >
                <option value="">Sifariş seç</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.id} · {formatMoney(order.totalPrice)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Səbəb
              <select
                value={draft.reason}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, reason: e.target.value }))
                }
              >
                {REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary-btn">
              Sorğu göndər
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RefundRequests;
