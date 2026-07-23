import { useState, useEffect } from "react";
import { getEvents, getShows } from "../../api/api";
import EventCard from "../../components/EventCard/EventCard";
import EventFilters from "../../components/EventFilters/EventFilters";
import Loader from "../../components/Loader/Loader";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    Promise.all([getEvents(), getShows()]).then(([eventsRes, showsRes]) => {
      setEvents([...eventsRes.data, ...showsRes.data]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loader count={8} />;
  }
  const cities = [...new Set(events.map((event) => event.city))];
  const filteredEvents = events.filter((event) => {
    const cityMatch = selectedCity === "all" || event.city === selectedCity;
    const dateMatch = !selectedDate || event.date.slice(0, 10) === selectedDate;
    return cityMatch && dateMatch;
  });

  return (
    <div className="home-page">
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

export default Home;
