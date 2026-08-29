import { useState, useEffect, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../api/api";
import Loader from "../components/Loader/Loader";
import { useLanguage } from "../hooks/useLanguage";
import { formatDateTime, formatMoney } from "./profileHelpers";

const STATUS_LABEL_KEYS = {
  confirmed: "orders.statusConfirmed",
  pending_payment: "orders.statusPendingPayment",
  reserved: "orders.statusReserved",
  expired: "orders.statusExpired",
  cancelled: "orders.statusCancelled",
  refunded: "orders.statusRefunded",
};

const TABS = [
  { key: "all", labelKey: "orders.tabAll" },
  { key: "confirmed", labelKey: "orders.statusConfirmed" },
  { key: "pending_payment", labelKey: "orders.statusPendingPayment" },
  { key: "reserved", labelKey: "orders.statusReserved" },
  { key: "expired", labelKey: "orders.statusExpired" },
  { key: "cancelled", labelKey: "orders.statusCancelled" },
  { key: "refunded", labelKey: "orders.statusRefunded" },
];

const Orders = () => {
  const { t } = useLanguage();
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
        <h1>{t("orders.title")}</h1>
      </div>

      <div className="profile-tabs profile-tabs-scroll">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.key}
            className={tab === item.key ? "active" : undefined}
            onClick={() => setTab(item.key)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader count={4} />
      ) : visible.length === 0 ? (
        <p className="profile-empty">{t("orders.empty")}</p>
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
                  {STATUS_LABEL_KEYS[order.status]
                    ? t(STATUS_LABEL_KEYS[order.status])
                    : order.status}
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
