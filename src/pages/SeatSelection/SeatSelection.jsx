import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventOrShowById } from "../../api/api";
import { getSeatStatus, holdSeat, releaseSeat } from "../../api/seats";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useCountdown } from "../../hooks/useCountdown";
import Loader from "../../components/Loader/Loader";
import SeatMap from "../../components/SeatMap/SeatMap";

// seatKey formatı: `${ticketId}-r${row}-s${seat}` — məs. "201-1-r3-s5"
const parseSeatKey = (key) => {
  const match = key.match(/^(.*)-r(\d+)-s(\d+)$/);
  if (!match) return null;
  return { ticketId: match[1], row: Number(match[2]), seatNumber: Number(match[3]) };
};

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [takenSeats, setTakenSeats] = useState(new Set());
  const [holdDeadline, setHoldDeadline] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const eventRef = useRef(null);

  // seatKey-dən tam seçim obyektini bərpa edir (səhifə yeniləndikdə lazımdır)
  const buildSelected = useCallback((seatKey) => {
    const parsed = parseSeatKey(seatKey);
    const ev = eventRef.current;
    if (!parsed || !ev) return null;
    const ticket = ev.tickets.find((t) => String(t.id) === parsed.ticketId);
    if (!ticket) return null;
    return {
      key: seatKey,
      row: parsed.row,
      seatNumber: parsed.seatNumber,
      sectionName: ticket.label,
      price: ticket.price,
    };
  }, []);

  // backend-dən yerlərin vəziyyətini oxuyur: tutulmuşları və öz hold-larımızı ayırır
  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getSeatStatus(id, user.id);
      const others = new Set();
      const mine = [];
      let earliest = null;

      for (const t of data.taken) {
        if (t.mine && t.status === "held") {
          const seat = buildSelected(t.seatKey);
          if (seat) mine.push(seat);
          if (t.expiresAt && (!earliest || new Date(t.expiresAt) < new Date(earliest))) {
            earliest = t.expiresAt;
          }
        } else {
          // başqasının tutduğu, satılmış, və ya öz artıq alınmış yerlərim
          others.add(t.seatKey);
        }
      }

      setTakenSeats(others);
      setSelectedSeats(mine);
      setHoldDeadline(mine.length > 0 ? earliest : null);
    } catch {
      // yer serveri əlçatan deyilsə, xəritə işləməyə davam etsin (kilid olmadan)
      setTakenSeats(new Set());
    }
  }, [id, user, buildSelected]);

  useEffect(() => {
    getEventOrShowById(id).then((data) => {
      eventRef.current = data;
      setEvent(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!event || !user) return;
    let active = true;
    const run = () => active && refresh();
    const timeout = setTimeout(run, 0);
    const interval = setInterval(run, 8000);
    return () => {
      active = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [event, user, refresh]);

  const { minutes, seconds } = useCountdown(holdDeadline);

  if (loading) {
    return <Loader count={1} />;
  }

  if (!event) {
    return <div className="page">Tədbir tapılmadı.</div>;
  }

  // giriş etməmiş istifadəçi yer seçə bilməz (yerin kimə aid olduğunu bilmək üçün lazımdır)
  if (!user) {
    return (
      <div className="seat-selection">
        <h1>{event.title}</h1>
        <div className="seat-auth-gate">
          <i className="fas fa-user-lock" />
          <p>Yer seçmək üçün hesabınıza daxil olun.</p>
          <Link to="/login" className="buy-btn" state={{ from: `/event/${id}/seats` }}>
            Daxil ol
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleSeatClick = async (seat, ticket) => {
    if (busy) return;
    if (seat.presold || takenSeats.has(seat.key)) return; // tutulub — toxunma
    setError(null);

    const alreadySelected = selectedSeats.some((s) => s.key === seat.key);
    setBusy(true);
    try {
      if (alreadySelected) {
        await releaseSeat(event.id, seat.key, user.id);
      } else {
        await holdSeat(event.id, seat.key, user.id);
      }
      await refresh();
    } catch (err) {
      // 409 = başqası tərəfindən artıq tutulub
      setError(err.message || "Yer tutula bilmədi");
      await refresh();
    } finally {
      setBusy(false);
    }
    // ticket parametri legend/qiymət üçün SeatMap-də istifadə olunur
    void ticket;
  };

  const handleAddToCart = () => {
    selectedSeats.forEach((seat) => {
      addToCart({
        id: `${event.id}-${seat.key}`,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        venue: event.venue,
        ticketLabel: `${seat.sectionName} (Sıra ${seat.row}, Yer ${seat.seatNumber})`,
        seatInfo: {
          eventId: event.id,
          seatKey: seat.key,
          row: seat.row,
          seatNumber: seat.seatNumber,
          sectionName: seat.sectionName,
          price: seat.price,
        },
        price: seat.price,
        quantity: 1,
      });
    });
    navigate("/cart");
  };

  return (
    <div className="seat-selection">
      <h1>{event.title}</h1>
      <p className="event-detail-meta">{event.venue}</p>

      {error && <p className="payment-error">{error}</p>}

      <SeatMap
        tickets={event.tickets}
        selectedSeats={selectedSeats}
        takenSeats={takenSeats}
        onSeatClick={handleSeatClick}
      />

      {selectedSeats.length > 0 && (
        <div className="seat-selection-footer">
          <span>
            {selectedSeats.length} yer seçildi · {totalPrice} ₼
            {holdDeadline && (
              <span className="seat-hold-timer">
                {" "}· {minutes}:{String(seconds).padStart(2, "0")} ərzində saxlanılır
              </span>
            )}
          </span>
          <button type="button" className="buy-btn" onClick={handleAddToCart} disabled={busy}>
            Səbətə əlavə et
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
