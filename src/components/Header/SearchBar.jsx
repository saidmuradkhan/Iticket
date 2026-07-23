import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../../context/LanguageContext";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const handleSubmit = (e) => {e.preventDefault();
    if (value.trim()) navigate(`/search/${encodeURIComponent(value.trim())}`);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input type="text" placeholder={t("search")} value={value} onChange={(e) => setValue(e.target.value)} />
    </form>
  );
};

export default SearchBar;
