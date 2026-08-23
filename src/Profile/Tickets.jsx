import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { getOrders } from "../api/api";
import Loader from "../components/Loader/Loader";
import { formatEventDate } from "../utils/dateHelpers";
import { SearchIcon } from "./ProfileIcons";
import { parseOrderDate } from "./profileHelpers";

const TABS = [
  { key: "upcoming", label: "Gələcək tədbirlər" },
  { key: "past", label: "Keçmiş tədbirlər" },
];

const Tickets = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getOrders(user.id).then((res) => {
      const now = Date.now();
      const confirmed = res.data.filter((order) => order.status === "confirmed");
      const items = confirmed.flatMap((order) =>
        order.items.map((item) => {
          const date = parseOrderDate(item.eventDate);
          return {
            ...item,
            orderId: order.id,
            date,
            isPast: date ? date.getTime() < now : false,
          };
        })
      );
      setTickets(items);
      setLoading(false);
    });
  }, [user.id]);

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tickets.filter((item) => {
      if (tab === "upcoming" ? item.isPast : !item.isPast) return false;
      if (!search) return true;
      return `${item.eventTitle} ${item.venue}`.toLowerCase().includes(search);
    });
  }, [tickets, tab, query]);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Biletlər</h1>
        <label className="profile-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tədbir axtarın"
          />
        </label>
      </div>

      <div className="profile-tabs">
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
        <Loader count={3} />
      ) : visible.length === 0 ? (
        <p className="profile-empty">
          {tab === "upcoming"
            ? "Hazırda gələcək tədbirlər üçün biletiniz yoxdur."
            : "Keçmiş tədbirlər üçün biletiniz yoxdur."}
        </p>
      ) : (
        <div className="tickets-list">
          {visible.map((item, i) => (
            <div className="ticket-card" key={`${item.orderId}-${i}`}>
              <div className="ticket-card-body">
                <h3>{item.eventTitle}</h3>
                <p className="event-card-meta">
                  {item.date ? formatEventDate(item.date) : item.eventDate}
                </p>
                <p className="event-card-meta">{item.venue}</p>
                <p className="event-card-meta">
                  {item.ticketLabel} × {item.quantity}
                </p>
              </div>
              <div className="ticket-card-side">
                <span className="ticket-card-order">#{item.orderId}</span>
                <p className="event-card-price">
                  {item.price * item.quantity} ₼
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
