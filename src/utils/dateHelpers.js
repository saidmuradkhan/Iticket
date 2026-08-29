export const MONTH_NAMES = {
  az: [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

export const DAY_NAMES = {
  az: ["b.", "b.e.", "ç.a.", "ç.", "c.a.", "c.", "ş."],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export const getLang = () => {
  if (typeof window === "undefined") return "az";
  try {
    return JSON.parse(window.localStorage.getItem("language")) || "az";
  } catch {
    return "az";
  }
};

export const getMonthNames = (lang = getLang()) => MONTH_NAMES[lang] || MONTH_NAMES.az;
export const getDayNames = (lang = getLang()) => DAY_NAMES[lang] || DAY_NAMES.az;

export const formatEventDate = (isoString, lang = getLang()) => {
  const d = new Date(isoString);
  return `${d.getDate()} ${getMonthNames(lang)[d.getMonth()]}`;
};

export const isEventPast = (isoString) => {
  const time = new Date(isoString).getTime();
  return !Number.isNaN(time) && time < Date.now();
};
