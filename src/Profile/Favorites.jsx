import { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";
import EventCard from "../components/EventCard/EventCard";
import { useLanguage } from "../hooks/useLanguage";

const Favorites = () => {
  const { favorites } = useContext(FavoritesContext);
  const { t } = useLanguage();

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>{t("favorites.title")}</h1>
      </div>

      {favorites.length === 0 ? (
        <p className="profile-empty">{t("favorites.empty")}</p>
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
