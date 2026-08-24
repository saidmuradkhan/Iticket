import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { DEFAULT_FILTERS, filterEvents } from "../../utils/eventFilterHelpers";
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
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category: category || "all",
  }));

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: category || "all" }));
  }, [category]);

  if (loading) {
    return <Loader count={8} />;
  }

  const cities = [...new Set(events.map((event) => event.city))];
  const venues = [...new Set(events.map((event) => event.venue))];

  const searchedEvents = query
    ? events.filter((event) => event.title.toLowerCase().includes(query.toLowerCase()))
    : events;

  const filteredEvents = filterEvents(searchedEvents, filters);

  const heading = category
    ? CATEGORY_LABELS[category] || category
    : `"${query}" üçün nəticələr`;

  return (
    <div className="home-page">
      <h1 className="event-list-heading">{heading}</h1>

      <EventFilters
        cities={cities}
        venues={venues}
        filters={filters}
        onFiltersChange={setFilters}
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
