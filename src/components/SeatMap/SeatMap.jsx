import SeatSection from "./SeatSection";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#14b8a6"];
const SEATS_PER_ROW = 10;

// seatKey əsasında sabit (deterministik) hash — hər render və hər istifadəçidə eynidir
const hashKey = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
};

// yerlərin ~28%-i "əvvəlcədən satılmış" görünür (kosmetik, hamı üçün eyni)
const isPreSold = (key) => hashKey(key) % 100 < 28;

// tier.available əsasında SABİT oturacaq şəbəkəsi yaradır (təsadüfi deyil)
const generateSeats = (ticket) => {
  const capacity = Math.max(
    SEATS_PER_ROW,
    Math.ceil(ticket.available / SEATS_PER_ROW) * SEATS_PER_ROW
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
  const taken = takenSeats || new Set();

  return (
    <div className="seat-map">
      <div className="stage-bar">SƏHNƏ</div>

      <div className="seat-legend">
        {tickets.map((ticket, index) => (
          <div className="legend-item" key={ticket.id}>
            <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }} /> {ticket.label} · {ticket.price} ₼
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-dot sold" /> Satılıb / tutulub
        </div>
        <div className="legend-item">
          <span className="legend-dot selected" /> Seçilmiş
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
