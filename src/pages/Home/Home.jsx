import { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { useEvents } from "../../hooks/useEvents";
import { DEFAULT_FILTERS, filterEvents } from "../../utils/eventFilterHelpers";
import EventCard from "../../components/EventCard/EventCard";
import EventFilters from "../../components/EventFilters/EventFilters";
import HeroSection from "../../components/HeroSection/HeroSection";
import Loader from "../../components/Loader/Loader";

const Home = () => {
  const { t } = useLanguage();
  const { events, loading } = useEvents();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  if (loading) {
    return <Loader count={8} />;
  }

  const cities = [...new Set(events.map((event) => event.city))];
  const venues = [...new Set(events.map((event) => event.venue))];
  const filteredEvents = filterEvents(events, filters);

  return (
    <div className="home-page">
      <HeroSection events={events} />

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
          <p className="empty-state">{t("home.noEventsFound")}</p>
        )}
      </div>
    </div>
  );
};

export default Home;
