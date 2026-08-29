import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { getEventOrShowById } from "../../api/api";
import { useEvents } from "../../hooks/useEvents";
import { formatEventDate } from "../../utils/dateHelpers";
import { FavoritesContext } from "../../context/FavoritesContext";
import Loader from "../../components/Loader/Loader";
import SeatBooking from "../../components/SeatMap/SeatBooking";

const scrollSimilar = (direction) => {
  const track = document.getElementById("similar-track");
  if (track) track.scrollBy({ left: direction * 280, behavior: "smooth" });
};

const EventDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { events: allEvents } = useEvents();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heroErrorId, setHeroErrorId] = useState(null);

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
    return <div className="page">{t("eventDetail.eventNotFound")}</div>;
  }

  const isSoldOut = event.status === "soldout";
  const favorite = isFavorite(event.id);

  const heroImgError = String(heroErrorId) === String(event.id);
  const heroImage = heroImgError
    ? event.image
    : event.detailedimage || event.image;

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
    const section = document.getElementById("seat-booking-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
      } catch {
        // istifadəçi paylaşımı ləğv etdi — heç nə etmirik
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
        style={{ backgroundImage: `url(${heroImage})` }}
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
              {isSoldOut && <span className="hero-tag soldout">{t("eventDetail.soldOut")}</span>}
            </div>

            <button
              type="button"
              className="buy-btn hero-buy-btn"
              onClick={handleBuyClick}
              disabled={isSoldOut}
            >
              {isSoldOut ? t("eventDetail.soldOut") : t("eventDetail.buyTicket")}
            </button>
          </div>

          <div className="event-hero-image-frame">
            <img
              src={heroImage}
              alt={event.title}
              onError={() => setHeroErrorId(event.id)}
            />
            <div className="hero-icon-actions">
              <button
                type="button"
                className="hero-icon-btn"
                onClick={() => toggleFavorite(event)}
                aria-label={t("eventDetail.addToFavorites")}
              >
                <i className={favorite ? "fas fa-heart" : "far fa-heart"} />
              </button>
              <button
                type="button"
                className="hero-icon-btn"
                onClick={handleShare}
                aria-label={t("eventDetail.share")}
              >
                <i className="fas fa-share-alt" />
              </button>
            </div>
            {copied && <span className="copied-toast">{t("eventDetail.linkCopied")}</span>}
          </div>
        </div>
      </section>

      {!isSoldOut && (
        <section className="event-seat-section" id="seat-booking-section">
          <h2>{t("eventDetail.seatSelection")}</h2>
          <SeatBooking event={event} />
        </section>
      )}

      <section className="event-lower">
        <div className="event-lower-main">
          <h2>{t("eventDetail.description")}</h2>
          <p className={expanded ? "event-about expanded" : "event-about"}>
            {event.about}
          </p>
          {event.about && event.about.length > 80 && (
            <button
              type="button"
              className="expand-btn"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? t("eventDetail.showLess") : t("eventDetail.showMore")}{" "}
              <i className={expanded ? "fas fa-chevron-up" : "fas fa-chevron-down"} />
            </button>
          )}

          <h2>{t("eventDetail.rules")}</h2>
          <p className="event-rules">{t("eventDetail.qrRule")}</p>
          <p className="event-rules warning">
            <i className="fas fa-exclamation-circle" /> {t("eventDetail.foodWarning")}
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
            <i className="fas fa-map" /> {t("eventDetail.viewOnMap")}
          </a>
        </div>

        <div className="event-lower-side">
          <h2>{t("eventDetail.gallery")}</h2>
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
            <h2>{t("eventDetail.similarEvents")}</h2>
            <div className="carousel-arrows">
              <button type="button" onClick={() => scrollSimilar(-1)} aria-label={t("eventDetail.previous")}>
                <i className="fas fa-chevron-left" />
              </button>
              <button type="button" onClick={() => scrollSimilar(1)} aria-label={t("eventDetail.next")}>
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
          {t("eventDetail.buyTicket")}
        </button>
      )}
    </div>
  );
};

export default EventDetail;
