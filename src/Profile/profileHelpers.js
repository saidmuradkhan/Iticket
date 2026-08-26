
export const parseOrderDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) return isNaN(value) ? null : value;

  const dotted = String(value).match(
    /^(\d{2})\.(\d{2})\.(\d{2,4})(?:\s+(\d{2}):(\d{2}))?/
  );
  if (dotted) {
    const [, day, month, year, hour = "0", minute = "0"] = dotted;
    const fullYear = year.length === 2 ? 2000 + Number(year) : Number(year);
    return new Date(
      fullYear,
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );
  }

  const parsed = new Date(value);
  return isNaN(parsed) ? null : parsed;
};

export const formatDateTime = (value) => {
  const date = parseOrderDate(value);
  if (!date) return "—";

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export const formatMoney = (amount) => `${Number(amount || 0).toFixed(2)} ₼`;
