import { createContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useLocalStorage("favorites", []);

  const isFavorite = (id) => favorites.some((item) => item.id === id);

  const toggleFavorite = (event) => {
    if (isFavorite(event.id)) {
      setFavorites((prev) => prev.filter((item) => item.id !== event.id));
    } else {
      setFavorites((prev) => [...prev, event]);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
