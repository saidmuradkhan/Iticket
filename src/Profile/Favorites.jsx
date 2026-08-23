import { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import EventCard from "../components/EventCard/EventCard";

const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Sevimlilər</h1>
      </div>

      {favorites.length === 0 ? (
        <p className="profile-empty">
          Sevimlilərinizə hələ tədbir əlavə etməmisiniz.
        </p>
      ) : (
        <div className="event-grid">
          {favorites.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
