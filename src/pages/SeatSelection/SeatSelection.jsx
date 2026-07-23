import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventOrShowById } from "../../api/api";
import { CartContext } from "../../context/CartContext";
import Loader from "../../components/Loader/Loader";
import SeatMap from "../../components/SeatMap/SeatMap";

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    getEventOrShowById(id).then((data) => {
      setEvent(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <Loader count={1} />;
  }

  if (!event) {
    return <div className="page">Tədbir tapılmadı.</div>;
  }

  const handleSeatClick = (seat, ticket) => {
    if (seat.sold) return;
    const exists = selectedSeats.some((s) => s.key === seat.key);
    if (exists) {
      setSelectedSeats((prev) => prev.filter((s) => s.key !== seat.key));
    } else {
      setSelectedSeats((prev) => [
        ...prev,
        {
          key: seat.key,
          row: seat.row,
          seatNumber: seat.seatNumber,
          sectionName: ticket.label,
          price: ticket.price,
        },
      ]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

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

      <SeatMap tickets={event.tickets} selectedSeats={selectedSeats} onSeatClick={handleSeatClick} />

      {selectedSeats.length > 0 && (
        <div className="seat-selection-footer">
          <span>
            {selectedSeats.length} yer seçildi · {totalPrice} ₼
          </span>
          <button type="button" className="buy-btn" onClick={handleAddToCart}>
            Səbətə əlavə et
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
