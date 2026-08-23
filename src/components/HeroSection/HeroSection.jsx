import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatEventDate } from "../../utils/dateHelpers";

const AUTO_ROTATE_MS = 5000;

const HeroSection = ({ events }) => {
  const slides = events.slice(0, 5);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[current];

  return (
    <div className="hero-section">
      <div className="hero-slider">
        <button className="hero-nav-arrow prev" onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}>
          <i className="fas fa-chevron-left" />
        </button>
        
        <Link
          key={slide.id}
          to={`/event/${slide.id}`}
          className="hero-slide"
          style={{ backgroundImage: `url(${slide.detailedimage || slide.image})` }}
        >
          <div className="hero-slide-overlay" />
          <div className="hero-slide-content">
            <h2>{slide.title}</h2>
            <p>
              {formatEventDate(slide.date)} · {slide.venue}
            </p>
            <span className="hero-price-badge">{slide.price} ₼-dən</span>
          </div>
        </Link>

        <button className="hero-nav-arrow next" onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}>
          <i className="fas fa-chevron-right" />
        </button>

        <div className="hero-dots">
          {slides.map((s, index) => (
            <button
              key={s.id}
              type="button"
              className={index === current ? "hero-dot active" : "hero-dot"}
              onClick={() => setCurrent(index)}
              aria-label={`Slayd ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="gift-card">
        <p className="gift-card-title">
          Sevdiklərinizi <span>"İGİFT"</span> ilə sevindirin!
        </p>
        <div className="gift-card-mock">
          <span className="gift-card-brand">igift.az</span>
          <span className="gift-card-number">1234 5678 9000 0000</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
