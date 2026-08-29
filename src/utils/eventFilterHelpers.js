import { formatEventDate } from "./dateHelpers";

export const CATEGORY_OPTIONS = [
  { key: "all", label: "nav.all" },
  { key: "concert", label: "nav.concert" },
  { key: "theatre", label: "nav.theatre" },
  { key: "kids", label: "nav.kids" },
  { key: "festival", label: "nav.festival" },
  { key: "film", label: "nav.film" },
];

export const PRICE_PRESETS = [
  { key: "0-50", label: "0-50 ₼", min: 0, max: 50 },
  { key: "50-100", label: "50-100 ₼", min: 50, max: 100 },
  { key: "100-150", label: "100-150 ₼", min: 100, max: 150 },
];

export const SORT_OPTIONS = [
  { key: "popularity", label: "filters.sortPopularity" },
  { key: "date-asc", label: "filters.sortDateAsc" },
  { key: "date-desc", label: "filters.sortDateDesc" },
  { key: "price-asc", label: "filters.sortPriceAsc" },
  { key: "price-desc", label: "filters.sortPriceDesc" },
  { key: "newest", label: "filters.sortNewest" },
];

export const DEFAULT_FILTERS = {
  category: "all",
  city: "all",
  venue: "all",
  priceMin: null,
  priceMax: null,
  dateStart: null,
  dateEnd: null,
  sort: "popularity",
};

export const filterEvents = (events, filters) => {
  const filtered = events.filter((event) => {
    const dateStr = event.date.slice(0, 10);
    const categoryMatch = filters.category === "all" || event.category === filters.category;
    const cityMatch = filters.city === "all" || event.city === filters.city;
    const venueMatch = filters.venue === "all" || event.venue === filters.venue;
    const priceMatch =
      (filters.priceMin === null || event.price >= filters.priceMin) &&
      (filters.priceMax === null || event.price <= filters.priceMax);
    const dateMatch =
      (!filters.dateStart || dateStr >= filters.dateStart) &&
      (!filters.dateEnd || dateStr <= filters.dateEnd);
    return categoryMatch && cityMatch && venueMatch && priceMatch && dateMatch;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "date-asc":
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "date-desc":
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      sorted.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    default:
      break;
  }

  return sorted;
};

export const formatDateRange = (start, end) => {
  if (!start) return null;
  if (!end || start === end) return formatEventDate(start);
  return `${formatEventDate(start)} – ${formatEventDate(end)}`;
};
