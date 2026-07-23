import { NavLink } from "react-router-dom";

const categories = [
  { key: "all", label: "Bütün tədbirlər", path: "/" },
  { key: "concert", label: "Konsert", path: "/events/concert" },
  { key: "theatre", label: "Tamaşa", path: "/events/theatre" },
  { key: "kids", label: "Uşaqlar", path: "/events/kids" },
  { key: "festival", label: "Festival", path: "/events/festival" },
  { key: "film", label: "Film", path: "/events/film" },
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
          {cat.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default CategoryNav;
