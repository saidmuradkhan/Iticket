import { useState } from "react";
import { MONTH_NAMES } from "../../utils/dateHelpers";
import {
  CATEGORY_OPTIONS,
  PRICE_PRESETS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
  formatDateRange,
} from "../../utils/eventFilterHelpers";
import FilterDropdown from "./FilterDropdown";
import SearchableListPanel from "./SearchableListPanel";

const DAY_NAMES = ["b.", "b.e.", "ç.a.", "ç.", "c.a.", "c.", "ş."];

// bugündən başlayaraq N gün üçün təqvim datası hazırlayır
const generateDays = (count) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dayOfWeek = d.getDay();
    days.push({
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dayName: DAY_NAMES[dayOfWeek],
      dayNum: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      monthKey: `${d.getFullYear()}-${d.getMonth()}`,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }
  return days;
};

const groupByMonth = (days) => {
  const groups = [];
  days.forEach((day) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.monthKey === day.monthKey) {
      lastGroup.days.push(day);
    } else {
      groups.push({ monthKey: day.monthKey, month: day.month, days: [day] });
    }
  });
  return groups;
};

// modul yüklənəndə bir dəfə hesablanır, hər render-də təkrar hesablamağa ehtiyac yoxdur
const monthGroups = groupByMonth(generateDays(60));

const PricePanel = ({ priceMin, priceMax, onApply, close }) => {
  const [customMin, setCustomMin] = useState(priceMin ?? "");
  const [customMax, setCustomMax] = useState(priceMax ?? "");

  const selectPreset = (preset) => {
    onApply(preset.min, preset.max);
    close();
  };

  const applyCustom = () => {
    onApply(
      customMin === "" ? null : Number(customMin),
      customMax === "" ? null : Number(customMax)
    );
    close();
  };

  return (
    <div className="price-panel">
      <button
        type="button"
        className="list-item"
        onClick={() => {
          onApply(null, null);
          close();
        }}
      >
        Bütün qiymətlər
      </button>
      {PRICE_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          className="list-item"
          onClick={() => selectPreset(preset)}
        >
          {preset.label}
        </button>
      ))}
      <p className="price-panel-label">Qiymət aralığı yazın</p>
      <div className="price-range-inputs">
        <input
          type="number"
          placeholder="Min"
          value={customMin}
          onChange={(e) => setCustomMin(e.target.value)}
        />
        <span>—</span>
        <input
          type="number"
          placeholder="Max"
          value={customMax}
          onChange={(e) => setCustomMax(e.target.value)}
        />
      </div>
      <button type="button" className="apply-btn" onClick={applyCustom}>
        Təsdiqlə
      </button>
    </div>
  );
};

const EventFilters = ({ cities, venues, filters, onFiltersChange }) => {
  const updateFilter = (patch) => onFiltersChange({ ...filters, ...patch });

  const handleDayClick = (dateStr) => {
    const { dateStart, dateEnd } = filters;
    if (dateStart && !dateEnd) {
      if (dateStr === dateStart) {
        updateFilter({ dateStart: null, dateEnd: null });
      } else if (dateStr < dateStart) {
        updateFilter({ dateStart: dateStr, dateEnd: dateStart });
      } else {
        updateFilter({ dateEnd: dateStr });
      }
    } else {
      updateFilter({ dateStart: dateStr, dateEnd: null });
    }
  };

  const dayClassName = (dateStr) => {
    const { dateStart, dateEnd } = filters;
    let className = "cal-day";
    if (dateStart && (dateStr === dateStart || dateStr === dateEnd)) {
      className += " is-selected";
    } else if (dateStart && dateEnd && dateStr > dateStart && dateStr < dateEnd) {
      className += " is-in-range";
    }
    return className;
  };

  const activeSort = SORT_OPTIONS.find((opt) => opt.key === filters.sort);
  const dateRangeLabel = formatDateRange(filters.dateStart, filters.dateEnd);

  const chips = [
    dateRangeLabel && {
      key: "date",
      label: dateRangeLabel,
      onRemove: () => updateFilter({ dateStart: null, dateEnd: null }),
    },
    filters.category !== "all" && {
      key: "category",
      label: CATEGORY_OPTIONS.find((c) => c.key === filters.category)?.label,
      onRemove: () => updateFilter({ category: "all" }),
    },
    (filters.priceMin !== null || filters.priceMax !== null) && {
      key: "price",
      label: `${filters.priceMin ?? 0}-${filters.priceMax ?? "∞"} ₼`,
      onRemove: () => updateFilter({ priceMin: null, priceMax: null }),
    },
    filters.venue !== "all" && {
      key: "venue",
      label: filters.venue,
      onRemove: () => updateFilter({ venue: "all" }),
    },
    filters.city !== "all" && {
      key: "city",
      label: filters.city,
      onRemove: () => updateFilter({ city: "all" }),
    },
  ].filter(Boolean);

  return (
    <div className="event-filters">
      <div className="cal-track">
        {monthGroups.map((group) => (
          <section className="cal-month-group" key={group.monthKey}>
            <div className="cal-month">
              <span>{group.month}</span>
            </div>
            <div className="cal-days">
              {group.days.map((day) => (
                <button
                  key={day.dateStr}
                  type="button"
                  className={
                    dayClassName(day.dateStr) + (day.isWeekend ? " is-weekend" : "")
                  }
                  data-date={day.dateStr}
                  onClick={() => handleDayClick(day.dateStr)}
                >
                  <span className="name">{day.dayName}</span>
                  <span className="num">{day.dayNum}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="filter-bar">
        <FilterDropdown label={activeSort?.label || "Sırala"} active={filters.sort !== "popularity"}>
          {(close) => (
            <div className="searchable-list-items">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={filters.sort === opt.key ? "list-item active" : "list-item"}
                  onClick={() => {
                    updateFilter({ sort: opt.key });
                    close();
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </FilterDropdown>

        <FilterDropdown label="Tədbir növü" active={filters.category !== "all"}>
          {(close) => (
            <div className="searchable-list-items">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={filters.category === opt.key ? "list-item active" : "list-item"}
                  onClick={() => {
                    updateFilter({ category: opt.key });
                    close();
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </FilterDropdown>

        <FilterDropdown
          label="Qiymət"
          active={filters.priceMin !== null || filters.priceMax !== null}
        >
          {(close) => (
            <PricePanel
              priceMin={filters.priceMin}
              priceMax={filters.priceMax}
              onApply={(min, max) => updateFilter({ priceMin: min, priceMax: max })}
              close={close}
            />
          )}
        </FilterDropdown>

        <FilterDropdown label="Məkan" active={filters.venue !== "all"}>
          {(close) => (
            <SearchableListPanel
              items={venues}
              selected={filters.venue}
              onSelect={(venue) => updateFilter({ venue })}
              close={close}
              placeholder="Məkan axtar"
              allLabel="Bütün məkanlar"
            />
          )}
        </FilterDropdown>

        <FilterDropdown label="Şəhər" active={filters.city !== "all"}>
          {(close) => (
            <SearchableListPanel
              items={cities}
              selected={filters.city}
              onSelect={(city) => updateFilter({ city })}
              close={close}
              placeholder="Şəhər axtar"
              allLabel="Bütün şəhərlər"
            />
          )}
        </FilterDropdown>
      </div>

      {chips.length > 0 && (
        <div className="filter-chips">
          <button
            type="button"
            className="chip clear-chip"
            onClick={() => onFiltersChange(DEFAULT_FILTERS)}
            aria-label="Filtrləri təmizlə"
          >
            <i className="fas fa-times" />
          </button>
          {chips.map((chip) => (
            <button type="button" key={chip.key} className="chip" onClick={chip.onRemove}>
              {chip.label} <i className="fas fa-times" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
