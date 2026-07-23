import { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import EventCard from "../components/EventCard/EventCard";

const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);

  if (favorites.length === 0) {
    return <p>Sevimlilərinizə hələ tədbir əlavə etməmisiniz.</p>;
  }

  return (
    <div>
      <h1>Sevimlilər</h1>
      <div className="event-grid">
        {favorites.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
