import { useState } from "react";

// axtarışlı siyahı paneli - həm şəhər, həm məkan dropdown-u üçün istifadə olunur
const SearchableListPanel = ({ items, selected, onSelect, close, placeholder, allLabel }) => {
  const [search, setSearch] = useState("");
  const filtered = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (value) => {
    onSelect(value);
    close();
  };

  return (
    <div className="searchable-list">
      <div className="searchable-list-search">
        <i className="fas fa-search" />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="searchable-list-items">
        <button
          type="button"
          className={selected === "all" ? "list-item active" : "list-item"}
          onClick={() => handleSelect("all")}
        >
          {allLabel}
        </button>
        {filtered.map((item) => (
          <button
            key={item}
            type="button"
            className={selected === item ? "list-item active" : "list-item"}
            onClick={() => handleSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchableListPanel;
