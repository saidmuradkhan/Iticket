import { useState, useEffect, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../api/api";
import Loader from "../components/Loader/Loader";
import { formatDateTime, formatMoney } from "./profileHelpers";

const STATUS_LABELS = {
  confirmed: "Tamamlanıb",
  pending_payment: "Ödəniş gözlənilir",
  reserved: "Bronlanıb",
  expired: "Vaxtı bitib",
  cancelled: "Ləğv edilib",
  refunded: "Vəsait geri qaytarılıb",
};

const TABS = [
  { key: "all", label: "Hamısı" },
  { key: "confirmed", label: "Tamamlanıb" },
  { key: "pending_payment", label: "Ödəniş gözlənilir" },
  { key: "reserved", label: "Bronlanıb" },
  { key: "expired", label: "Vaxtı bitib" },
  { key: "cancelled", label: "Ləğv edilib" },
  { key: "refunded", label: "Vəsait geri qaytarılıb" },
];

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    getOrders(user.id).then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, [user.id]);

  const visible = useMemo(
    () => (tab === "all" ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab]
  );

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Sifarişlər</h1>
      </div>

      <div className="profile-tabs profile-tabs-scroll">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.key}
            className={tab === item.key ? "active" : undefined}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader count={4} />
      ) : visible.length === 0 ? (
        <p className="profile-empty">Bu bölmədə sifariş tapılmadı.</p>
      ) : (
        <div className="orders-list">
          {visible.map((order) => (
            <Link
              className="order-summary-card"
              key={order.id}
              to={`/profile/orders/${order.id}`}
            >
              <div className="order-summary-header">
                <span>#{order.id}</span>
                <span className={`status-badge ${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <p className="event-card-meta">{formatDateTime(order.createdAt)}</p>
              {order.items.map((item, i) => (
                <p className="event-card-meta" key={i}>
                  {item.eventTitle} · {item.ticketLabel} × {item.quantity}
                </p>
              ))}
              <p className="event-card-price">{formatMoney(order.totalPrice)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
