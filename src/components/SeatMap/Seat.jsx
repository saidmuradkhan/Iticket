const Seat = ({ seat, color, selected, onClick }) => {
  const className =
    "seat" + (seat.sold ? " sold" : "") + (selected ? " selected" : "");

  return (
    <button type="button" className={className} style={!seat.sold ? { "--seat-color": color } : undefined} disabled={seat.sold} onClick={onClick} title={`Sıra ${seat.row}, Yer ${seat.seatNumber}`} >
      {seat.seatNumber}
    </button>
  );
};

export default Seat;
