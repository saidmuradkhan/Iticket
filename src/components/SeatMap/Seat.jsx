const Seat = ({ seat, color, sold, selected, onClick }) => {
  const className = "seat" + (sold ? " sold" : "") + (selected ? " selected" : "");

  return (
    <button
      type="button"
      className={className}
      style={!sold ? { "--seat-color": color } : undefined}
      disabled={sold}
      onClick={onClick}
      title={`Sıra ${seat.row}, Yer ${seat.seatNumber}`}
    >
      {seat.seatNumber}
    </button>
  );
};

export default Seat;
