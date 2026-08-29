import SeatSection from "./SeatSection";
import { useLanguage } from "../../hooks/useLanguage";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#14b8a6"];
const SEATS_PER_ROW = 10;

// Test rejimi: heç bir yer əvvəlcədən satılmış sayılmır — hamısı seçilə bilər.
// Real satış simulyasiyasını geri qaytarmaq üçün key əsaslı hash-dən istifadə et.
const isPreSold = () => false;

const DEFAULT_AVAILABLE = 30;

const generateSeats = (ticket) => {
  const available = Number(ticket.available) > 0 ? Number(ticket.available) : DEFAULT_AVAILABLE;
  const capacity = Math.max(
    SEATS_PER_ROW,
    Math.ceil(available / SEATS_PER_ROW) * SEATS_PER_ROW
  );

  const seats = [];
  for (let i = 0; i < capacity; i++) {
    const row = Math.floor(i / SEATS_PER_ROW) + 1;
    const seatNumber = (i % SEATS_PER_ROW) + 1;
    const key = `${ticket.id}-r${row}-s${seatNumber}`;
    seats.push({ key, row, seatNumber, presold: isPreSold(key) });
  }
  return seats;
};

const SeatMap = ({ tickets, selectedSeats, takenSeats, onSeatClick }) => {
  const { t } = useLanguage();
  const taken = takenSeats || new Set();

  return (
    <div className="seat-map">
      <div className="stage-bar">{t("seatMap.stage")}</div>

      <div className="seat-legend">
        {tickets.map((ticket, index) => (
          <div className="legend-item" key={ticket.id}>
            <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }} /> {ticket.label} · {ticket.price} ₼
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-dot sold" /> {t("seatMap.sold")}
        </div>
        <div className="legend-item">
          <span className="legend-dot selected" /> {t("seatMap.selected")}
        </div>
      </div>

      <div className="seat-sections">
        {tickets.map((ticket, index) => (
          <SeatSection
            key={ticket.id}
            ticket={ticket}
            color={COLORS[index % COLORS.length]}
            seats={generateSeats(ticket)}
            selectedSeats={selectedSeats}
            takenSeats={taken}
            onSeatClick={onSeatClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
