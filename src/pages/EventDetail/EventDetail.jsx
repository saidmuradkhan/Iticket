import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventOrShowById } from "../../api/api";
import { formatEventDate } from "../../utils/dateHelpers";
import Loader from "../../components/Loader/Loader";
import Modal from "../../components/Modal/Modal";
import TicketSelector from "../../components/TicketSelector/TicketSelector";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  const handleBuyClick = () => {
    if (event.hasSeatMap) 
      {navigate(`/event/${event.id}/seats`);}
    else 
      {setShowModal(true);}
  };

  const isSoldOut = event.status === "soldout";

  return (
    <div className="event-detail">
      <img className="event-detail-banner" src={event.detailedimage || event.image} alt={event.title}/>

      <div className="event-detail-content">
        <h1>{event.title}</h1>
        <p className="event-detail-meta">
          {formatEventDate(event.date)} · {event.venue}
          {event.address ? ` · ${event.address}` : ""}
        </p>

        <div className="event-detail-tags">
          {event.ageLimit && <span className="tag">{event.ageLimit}</span>}
          {event.language && <span className="tag">{event.language}</span>}
          {isSoldOut && <span className="tag soldout">Biletlər bitib</span>}
        </div>
        {event.about && <p className="event-detail-about">{event.about}</p>}
        <div className="event-detail-tickets">
          <h2>Biletlər</h2>
          {event.tickets.map((ticket) => (
            <div className="ticket-row" key={ticket.id}>
              <span>{ticket.label}</span>
              <span>{ticket.price} ₼</span>
            </div>
          ))}
        </div>
        <button type="button" className="buy-btn" onClick={handleBuyClick} disabled={isSoldOut}> {isSoldOut ? "Biletlər bitib" : "Bilet al"}</button>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <TicketSelector event={event} onDone={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  );
};

export default EventDetail;
