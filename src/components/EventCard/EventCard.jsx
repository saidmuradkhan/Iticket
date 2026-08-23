import { useContext } from "react";
import { Link } from "react-router-dom";
import { FavoritesContext } from "../../context/FavoritesContext";
import { formatEventDate } from "../../utils/dateHelpers";

const EventCard = ({ event }) => {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const favorite = isFavorite(event.id);

  const formattedDate = formatEventDate(event.date);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    toggleFavorite(event);
  };

  return (
    <div className="event-card">
      <Link to={`/event/${event.id}`} className="event-card-image">
        <img src={event.image} alt={event.title} />
        {event.ageLimit && <span className="card-age-badge">{event.ageLimit}</span>}
        <span className="card-price-badge">{event.price} ₼</span>
        <button type="button" className={favorite ? "favorite-btn active" : "favorite-btn"} onClick={handleFavoriteClick} aria-label="Sevimlilərə əlavə et" >
          <i className={favorite ? "fas fa-heart" : "far fa-heart"} aria-hidden="true" />
        </button>
      </Link>
      <div className="event-card-body">
        <p className="event-card-date">{formattedDate}</p>
        <Link to={`/event/${event.id}`}>
          <h3>{event.title}</h3>
        </Link>
        <p className="event-card-meta">{event.venue}</p>
      </div>
    </div>
  );
};

export default EventCard;
