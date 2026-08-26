import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventOrShowById } from "../../api/api";
import { useEvents } from "../../hooks/useEvents";
import { formatEventDate } from "../../utils/dateHelpers";
import { FavoritesContext } from "../../context/FavoritesContext";
import Loader from "../../components/Loader/Loader";

const scrollSimilar = (direction) => {
  const track = document.getElementById("similar-track");
  if (track) track.scrollBy({ left: direction * 280, behavior: "smooth" });
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { events: allEvents } = useEvents();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const isSoldOut = event.status === "soldout";
  const favorite = isFavorite(event.id);

  const prices = event.tickets.map((ticket) => ticket.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel = minPrice === maxPrice ? `${minPrice} ₼` : `${minPrice}-${maxPrice} ₼`;

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.address || event.venue
  )}`;

  const similarEvents = allEvents
    .filter((e) => String(e.id) !== String(event.id) && e.category === event.category)
    .slice(0, 8);

  const handleBuyClick = () => {
    navigate(`/event/${event.id}/seats`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
      } catch {
        
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="event-detail">
      <section
        className="event-hero"
        style={{ backgroundImage: `url(${event.detailedimage || event.image})` }}
      >
        <div className="event-hero-overlay" />

        <div className="event-hero-body">
          <div className="event-hero-text">
            <h1>{event.title}</h1>
            <p className="event-hero-meta">
              {formatEventDate(event.date)} · {event.venue}
            </p>

            <div className="event-hero-tags">
              <span className="hero-tag">
                <i className="fas fa-ticket-alt" /> {priceLabel}
              </span>
              {event.ageLimit && (
                <span className="hero-tag">
                  <i className="fas fa-child" /> {event.ageLimit}
                </span>
              )}
              {event.language && (
                <span className="hero-tag">
                  <i className="fas fa-globe" /> {event.language}
                </span>
              )}
              {isSoldOut && <span className="hero-tag soldout">Biletlər bitib</span>}
            </div>

            <button
              type="button"
              className="buy-btn hero-buy-btn"
              onClick={handleBuyClick}
              disabled={isSoldOut}
            >
              {isSoldOut ? "Biletlər bitib" : "Bilet al"}
            </button>
          </div>

          <div className="event-hero-image-frame">
            <img src={event.detailedimage || event.image} alt={event.title} />
            <div className="hero-icon-actions">
              <button
                type="button"
                className="hero-icon-btn"
                onClick={() => toggleFavorite(event)}
                aria-label="Sevimlilərə əlavə et"
              >
                <i className={favorite ? "fas fa-heart" : "far fa-heart"} />
              </button>
              <button
                type="button"
                className="hero-icon-btn"
                onClick={handleShare}
                aria-label="Paylaş"
              >
                <i className="fas fa-share-alt" />
              </button>
            </div>
            {copied && <span className="copied-toast">Link kopyalandı</span>}
          </div>
        </div>
      </section>

      <section className="event-lower">
        <div className="event-lower-main">
          <h2>Təsvir</h2>
          <p className={expanded ? "event-about expanded" : "event-about"}>
            {event.about}
          </p>
          {event.about && event.about.length > 80 && (
            <button
              type="button"
              className="expand-btn"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Daha az" : "Daha çox"}{" "}
              <i className={expanded ? "fas fa-chevron-up" : "fas fa-chevron-down"} />
            </button>
          )}

          <h2>Qaydalar</h2>
          <p className="event-rules">
            Bu tədbir QR bilet formasında satılır. QR biletlər tədbir günü aktiv
            olacaqdır.
          </p>
          <p className="event-rules warning">
            <i className="fas fa-exclamation-circle" /> Tədbir məkanına kənardan
            alınmış qida və içkilərin gətirilməsi qadağandır.
          </p>

          <h2>{event.venue}</h2>
          {event.address && (
            <p className="venue-line">
              <i className="fas fa-map-marker-alt" /> {event.address}
            </p>
          )}
          <a
            className="map-btn"
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            <i className="fas fa-map" /> Xəritədə bax
          </a>
        </div>

        <div className="event-lower-side">
          <h2>Qalereya</h2>
          <img
            className="gallery-thumb"
            src={event.image}
            alt={event.title}
          />
        </div>
      </section>

      {similarEvents.length > 0 && (
        <section className="similar-events">
          <div className="similar-events-header">
            <h2>Oxşar tədbirlər</h2>
            <div className="carousel-arrows">
              <button type="button" onClick={() => scrollSimilar(-1)} aria-label="Geri">
                <i className="fas fa-chevron-left" />
              </button>
              <button type="button" onClick={() => scrollSimilar(1)} aria-label="İrəli">
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>

          <div className="similar-events-track" id="similar-track">
            {similarEvents.map((ev) => (
              <Link to={`/event/${ev.id}`} className="similar-card" key={ev.id}>
                <div className="similar-card-image">
                  <img src={ev.image} alt={ev.title} />
                  {ev.ageLimit && <span className="similar-age-tag">{ev.ageLimit}</span>}
                </div>
                <p className="similar-date">{formatEventDate(ev.date)}</p>
                <h4>{ev.title}</h4>
                <p className="similar-venue">{ev.venue}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!isSoldOut && (
        <button type="button" className="floating-buy-btn" onClick={handleBuyClick}>
          Bilet al
        </button>
      )}
    </div>
  );
};

export default EventDetail;
