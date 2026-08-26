import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSeatStatus, holdSeat, releaseSeat } from "../../api/seats";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useCountdown } from "../../hooks/useCountdown";
import SeatMap from "./SeatMap";

const parseSeatKey = (key) => {
  const match = key.match(/^(.*)-r(\d+)-s(\d+)$/);
  if (!match) return null;
  return { ticketId: match[1], row: Number(match[2]), seatNumber: Number(match[3]) };
};

const SeatBooking = ({ event }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [takenSeats, setTakenSeats] = useState(new Set());
  const [holdDeadline, setHoldDeadline] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const eventRef = useRef(event);
  useEffect(() => {
    eventRef.current = event;
  }, [event]);

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

  const refresh = useCallback(async () => {
    if (!user || !event) return;
    try {
      const data = await getSeatStatus(event.id, user.id);
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
          others.add(t.seatKey);
        }
      }

      setTakenSeats(others);
      setSelectedSeats(mine);
      setHoldDeadline(mine.length > 0 ? earliest : null);
    } catch {
      setTakenSeats(new Set());
    }
  }, [event, user, buildSelected]);

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

  if (!user) {
    return (
      <div className="seat-auth-gate">
        <i className="fas fa-user-lock" />
        <p>Yer seçmək üçün hesabınıza daxil olun.</p>
        <Link to="/login" className="buy-btn" state={{ from: `/event/${event.id}` }}>
          Daxil ol
        </Link>
      </div>
    );
  }

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleSeatClick = async (seat) => {
    if (busy) return;
    if (seat.presold || takenSeats.has(seat.key)) return;
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
      setError(err.message || "Yer tutula bilmədi");
      await refresh();
    } finally {
      setBusy(false);
    }
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
    <div className="seat-booking">
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

export default SeatBooking;
