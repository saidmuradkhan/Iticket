import { NavLink } from "react-router-dom";

const categories = [
  { key: "all", label: "Bütün tədbirlər", path: "/", icon: "fas fa-th-large" },
  { key: "concert", label: "Konsert", path: "/events/concert", icon: "fas fa-music" },
  { key: "theatre", label: "Tamaşa", path: "/events/theatre", icon: "fas fa-theater-masks" },
  { key: "kids", label: "Uşaqlar", path: "/events/kids", icon: "fas fa-child" },
  { key: "festival", label: "Festival", path: "/events/festival", icon: "fas fa-campground" },
  { key: "film", label: "Film", path: "/events/film", icon: "fas fa-film" },
];

const CategoryNav = () => {
  return (
    <nav className="category-nav">
      {categories.map((cat) => (
        <NavLink
          key={cat.key}
          to={cat.path}
          end={cat.path === "/"}
          className={({ isActive }) => isActive ? "category-pill active" : "category-pill"}
        >
          <i className={cat.icon + " cat-icon"} /> {cat.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default CategoryNav;
