import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { useEvents } from "../../hooks/useEvents";
import { DEFAULT_FILTERS, filterEvents } from "../../utils/eventFilterHelpers";
import EventCard from "../../components/EventCard/EventCard";
import EventFilters from "../../components/EventFilters/EventFilters";
import Loader from "../../components/Loader/Loader";

const CATEGORY_LABEL_KEYS = {
  concert: "eventList.categoryConcert",
  theatre: "eventList.categoryTheatre",
  kids: "eventList.categoryKids",
  festival: "eventList.categoryFestival",
  film: "eventList.categoryFilm",
};
let reloadedOnSearch = window.location.pathname.startsWith("/search/");
const consumeReloadedOnSearch = () => {
  const value = reloadedOnSearch;
  reloadedOnSearch = false;
  return value;
};

const EventList = () => {
  const { t } = useLanguage();
  const { category, query } = useParams();
  const { events, loading } = useEvents();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category: category || "all",
  }));

  useEffect(() => {
    if (query && consumeReloadedOnSearch()) {
      navigate("/", { replace: true });
    }
  }, [query, navigate]);

  useEffect(() => {
    if (query) window.scrollTo({ top: 0, behavior: "instant" });
  }, [query, loading]);

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
    ? (CATEGORY_LABEL_KEYS[category] ? t(CATEGORY_LABEL_KEYS[category]) : category)
    : t("eventList.searchResults", { query });

  return (
    <div className="home-page">
      <h1 className="event-list-heading">{heading}</h1>

      <EventFilters cities={cities} venues={venues} filters={filters} onFiltersChange={setFilters} />

      <div className="event-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <p className="empty-state">{t("eventList.noEventsFound")}</p>
        )}
      </div>
    </div>
  );
};

export default EventList;
