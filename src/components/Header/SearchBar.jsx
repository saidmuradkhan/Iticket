import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (!pathname.startsWith("/search/")) setValue("");
  }, [pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) navigate(`/search/${encodeURIComponent(value.trim())}`);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input type="text" placeholder={t("header.searchPlaceholder")} value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" className="search-submit" aria-label={t("header.searchPlaceholder")}>
        <i className="fas fa-search" />
      </button>
    </form>
  );
};

export default SearchBar;
