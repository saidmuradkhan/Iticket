import { useLanguage } from "../../hooks/useLanguage";

const Seat = ({ seat, color, sold, selected, onClick }) => {
  const { t } = useLanguage();
  const className = "seat" + (sold ? " sold" : "") + (selected ? " selected" : "");

  return (
    <button
      type="button"
      className={className}
      style={!sold ? { "--seat-color": color } : undefined}
      disabled={sold}
      onClick={onClick}
      title={t("seatMap.seatTitle", { row: seat.row, seat: seat.seatNumber })}
    >
      {seat.seatNumber}
    </button>
  );
};

export default Seat;
