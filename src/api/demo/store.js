import {
  events,
  shows,
  notifications,
  orders,
  topups,
  walletTransactions,
  seatHolds,
} from "../../../backend/db.json";

const STORAGE_KEY = "iticket-demo-db-v1";

export const DEMO_USER = {
  id: "demo",
  name: "Demo İstifadəçi",
  email: "demo@iticket.demo",
  phone: "",
  avatar: "https://i.pravatar.cc/150?img=12",
};

const withoutPayment = (item) => {
  const copy = { ...item };
  delete copy.payment;
  return copy;
};

const seed = () => ({
  events,
  shows,
  notifications,
  orders: orders.map(withoutPayment),
  topups: topups.map(withoutPayment),
  seatHolds,
  users: [DEMO_USER],
  walletTransactions,
});

const load = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return seed();
};

const db = load();

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    return;
  }
};

const newId = () => Math.random().toString(16).slice(2, 10);

const sameId = (a, b) => String(a) === String(b);

export const collection = (name) => {
  if (!db[name]) db[name] = [];
  return db[name];
};

export const find = (name, id) => collection(name).find((item) => sameId(item.id, id));

export const where = (name, filters = {}) =>
  collection(name).filter((item) =>
    Object.entries(filters).every(([key, value]) => sameId(item[key], value))
  );

export const insert = (name, data) => {
  const item = { ...data, id: data.id ?? newId() };
  collection(name).push(item);
  save();
  return item;
};

export const update = (name, id, patch) => {
  const item = find(name, id);
  if (!item) return null;
  Object.assign(item, patch);
  save();
  return item;
};

export const remove = (name, id) => {
  const items = collection(name);
  const index = items.findIndex((item) => sameId(item.id, id));
  if (index !== -1) {
    items.splice(index, 1);
    save();
  }
};
