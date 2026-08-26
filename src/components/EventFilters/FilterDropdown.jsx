import { useState } from "react";

const FilterDropdown = ({ label, active, children, panelClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div className="filter-dropdown">
      <button
        type="button"
        className={active ? "filter-trigger active" : "filter-trigger"}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label} <i className="fas fa-chevron-down" />
      </button>

      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={close} />
          <div
            className={
              panelClassName ? `filter-panel ${panelClassName}` : "filter-panel"
            }
          >
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;
