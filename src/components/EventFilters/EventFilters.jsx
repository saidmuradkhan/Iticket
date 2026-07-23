import { MONTH_NAMES } from "../../utils/dateHelpers";

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

const EventFilters = ({ cities, selectedCity, onCityChange, selectedDate, onDateChange }) => {
  const handleDayClick = (dateStr) => {
    onDateChange(selectedDate === dateStr ? null : dateStr);
  };

  return (
    <div className="event-filters">
      <select
        className="city-select"
        value={selectedCity}
        onChange={(e) => onCityChange(e.target.value)}
      >
        <option value="all">Bütün şəhərlər</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

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
                    "cal-day" +
                    (day.isWeekend ? " is-weekend" : "") +
                    (selectedDate === day.dateStr ? " is-selected" : "")
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
    </div>
  );
};

export default EventFilters;
