import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import EventCard from "../../components/EventCard/EventCard";
import EventFilters from "../../components/EventFilters/EventFilters";
import Loader from "../../components/Loader/Loader";

const CATEGORY_LABELS = {
  concert: "Konsert",
  theatre: "Tamaşa",
  kids: "Uşaqlar",
  festival: "Festival",
  film: "Film",
};

const EventList = () => {
  const { category, query } = useParams();
  const { events, loading } = useEvents();
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  if (loading) {
    return <Loader count={8} />;
  }

  const cities = [...new Set(events.map((event) => event.city))];

  const filteredEvents = events.filter((event) => {
    const categoryMatch = !category || event.category === category;
    const queryMatch =
      !query || event.title.toLowerCase().includes(query.toLowerCase());
    const cityMatch = selectedCity === "all" || event.city === selectedCity;
    const dateMatch = !selectedDate || event.date.slice(0, 10) === selectedDate;
    return categoryMatch && queryMatch && cityMatch && dateMatch;
  });

  const heading = category
    ? CATEGORY_LABELS[category] || category
    : `"${query}" üçün nəticələr`;

  return (
    <div className="home-page">
      <h1 className="event-list-heading">{heading}</h1>

      <EventFilters
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <div className="event-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <p className="empty-state">Bu filtrə uyğun tədbir tapılmadı.</p>
        )}
      </div>
    </div>
  );
};

export default EventList;
