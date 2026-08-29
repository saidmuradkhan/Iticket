import { useState } from "react";
import { getMonthNames, getDayNames } from "../../utils/dateHelpers";
import {
  CATEGORY_OPTIONS,
  PRICE_PRESETS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
  formatDateRange,
} from "../../utils/eventFilterHelpers";
import FilterDropdown from "./FilterDropdown";
import SearchableListPanel from "./SearchableListPanel";
import { useLanguage } from "../../hooks/useLanguage";

const generateDays = (count) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dayOfWeek = d.getDay();
    days.push({
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dayOfWeek,
      dayNum: d.getDate(),
      monthIndex: d.getMonth(),
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
      groups.push({ monthKey: day.monthKey, monthIndex: day.monthIndex, days: [day] });
    }
  });
  return groups;
};

const monthGroups = groupByMonth(generateDays(60));

const PricePanel = ({ priceMin, priceMax, onApply, close }) => {
  const { t } = useLanguage();
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
        {t("filters.allPrices")}
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
      <p className="price-panel-label">{t("filters.enterPriceRange")}</p>
      <div className="price-range-inputs">
        <input
          type="number"
          placeholder={t("filters.min")}
          value={customMin}
          onChange={(e) => setCustomMin(e.target.value)}
        />
        <span>—</span>
        <input
          type="number"
          placeholder={t("filters.max")}
          value={customMax}
          onChange={(e) => setCustomMax(e.target.value)}
        />
      </div>
      <button type="button" className="apply-btn" onClick={applyCustom}>
        {t("filters.apply")}
      </button>
    </div>
  );
};

const EventFilters = ({ cities, venues, filters, onFiltersChange }) => {
  const { t, language } = useLanguage();
  const monthNames = getMonthNames(language);
  const dayNames = getDayNames(language);
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
      label: t(CATEGORY_OPTIONS.find((c) => c.key === filters.category)?.label),
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
              <span>{monthNames[group.monthIndex]}</span>
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
                  <span className="name">{dayNames[day.dayOfWeek]}</span>
                  <span className="num">{day.dayNum}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="filter-bar">
        <FilterDropdown label={activeSort ? t(activeSort.label) : t("filters.sort")} active={filters.sort !== "popularity"}>
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
                  {t(opt.label)}
                </button>
              ))}
            </div>
          )}
        </FilterDropdown>

        <FilterDropdown label={t("filters.eventType")} active={filters.category !== "all"}>
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
                  {t(opt.label)}
                </button>
              ))}
            </div>
          )}
        </FilterDropdown>

        <FilterDropdown
          label={t("filters.price")}
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

        <FilterDropdown label={t("filters.venue")} active={filters.venue !== "all"}>
          {(close) => (
            <SearchableListPanel
              items={venues}
              selected={filters.venue}
              onSelect={(venue) => updateFilter({ venue })}
              close={close}
              placeholder={t("filters.searchVenue")}
              allLabel={t("filters.allVenues")}
            />
          )}
        </FilterDropdown>

        <FilterDropdown label={t("filters.city")} active={filters.city !== "all"}>
          {(close) => (
            <SearchableListPanel
              items={cities}
              selected={filters.city}
              onSelect={(city) => updateFilter({ city })}
              close={close}
              placeholder={t("filters.searchCity")}
              allLabel={t("filters.allCities")}
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
            aria-label={t("filters.clearFilters")}
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
