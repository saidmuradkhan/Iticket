import Seat from "./Seat";

const SEATS_PER_ROW = 10;

const SeatSection = ({ ticket, color, seats, selectedSeats, takenSeats, onSeatClick }) => {
  const rows = [];
  for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
    rows.push(seats.slice(i, i + SEATS_PER_ROW));
  }

  return (
    <div className="seat-section">
      <h3 style={{ color }}>{ticket.label}</h3>
      <div className="seat-rows">
        {rows.map((row) => (
          <div className="seat-row" key={row[0].row}>
            {row.map((seat) => {
              const sold = seat.presold || takenSeats.has(seat.key);
              const selected = selectedSeats.some((s) => s.key === seat.key);
              return (
                <Seat key={seat.key} seat={seat} color={color} sold={sold} selected={selected} onClick={() => onSeatClick(seat, ticket)} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatSection;
