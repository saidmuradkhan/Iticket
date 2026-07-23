export const MONTH_NAMES = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

export const formatEventDate = (isoString) => {
  const d = new Date(isoString);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};
