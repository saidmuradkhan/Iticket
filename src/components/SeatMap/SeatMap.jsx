import SeatSection from "./SeatSection";

const COLORS = ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#14b8a6"];
const SEATS_PER_ROW = 10;

// tier.available əsasında deterministik oturacaq şəbəkəsi yaradır (~30% əlavə yer satılmış sayılır)
const generateSeats = (ticket) => {
  const extraSold = Math.ceil(ticket.available * 0.3);
  const totalCapacity =
    Math.ceil((ticket.available + extraSold) / SEATS_PER_ROW) * SEATS_PER_ROW;
  const soldCount = totalCapacity - ticket.available;

  const seats = [];
  for (let i = 0; i < totalCapacity; i++) {
    const row = Math.floor(i / SEATS_PER_ROW) + 1;
    const seatNumber = (i % SEATS_PER_ROW) + 1;
    seats.push({
      key: `${ticket.id}-r${row}-s${seatNumber}`,
      row,
      seatNumber,
      sold: i < soldCount,
    });
  }
  return seats;
};

const SeatMap = ({ tickets, selectedSeats, onSeatClick }) => {
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
          <span className="legend-dot sold" /> Satılıb
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
            onSeatClick={onSeatClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
