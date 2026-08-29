import { NavLink } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";

const categories = [
  { key: "all", label: "nav.all", path: "/", icon: "fas fa-th-large" },
  { key: "concert", label: "nav.concert", path: "/events/concert", icon: "fas fa-music" },
  { key: "theatre", label: "nav.theatre", path: "/events/theatre", icon: "fas fa-theater-masks" },
  { key: "kids", label: "nav.kids", path: "/events/kids", icon: "fas fa-child" },
  { key: "festival", label: "nav.festival", path: "/events/festival", icon: "fas fa-campground" },
  { key: "film", label: "nav.film", path: "/events/film", icon: "fas fa-film" },
];

const CategoryNav = () => {
  const { t } = useLanguage();

  return (
    <nav className="category-nav">
      {categories.map((cat) => (
        <NavLink
          key={cat.key}
          to={cat.path}
          end={cat.path === "/"}
          className={({ isActive }) => isActive ? "category-pill active" : "category-pill"}
        >
          <i className={cat.icon + " cat-icon"} /> {t(cat.label)}
        </NavLink>
      ))}
    </nav>
  );
};

export default CategoryNav;
