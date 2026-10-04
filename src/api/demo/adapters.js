import { collection, find, insert, update, where } from "./store";
import { DEMO_USER } from "./store";
import { handlePaymentRequest } from "./paymentServer";

const parse = (config) => {
  const url = new URL(config.url, "http://demo.local");
  const query = Object.fromEntries(url.searchParams);
  Object.assign(query, config.params ?? {});
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data ?? {};
  return { path: url.pathname, query, body, method: (config.method || "get").toLowerCase() };
};

const reply = (config, status, data) => {
  const response = { data, status, statusText: "", headers: {}, config };
  if (status >= 400) {
    const error = new Error(data?.error || `Request failed with status ${status}`);
    error.response = response;
    error.config = config;
    return Promise.reject(error);
  }
  return Promise.resolve(response);
};

const sortItems = (items, sort, order) => {
  if (!sort) return items;
  const desc = sort.startsWith("-") || order === "desc";
  const key = sort.replace(/^-/, "");
  return [...items].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return (a[key] > b[key] ? 1 : -1) * (desc ? -1 : 1);
  });
};

const findOrCreateUser = (email) => {
  const existing = where("users", { email });
  if (existing.length > 0) return existing;
  const name = email.split("@")[0];
  return [insert("users", { ...DEMO_USER, id: `demo-${name}`, name, email })];
};

export const jsonServerAdapter = (config) => {
  const { path, query, body, method } = parse(config);
  const [name, id] = path.split("/").filter(Boolean);

  if (name === "users" && method === "get" && query.email) {
    return reply(config, 200, findOrCreateUser(query.email));
  }

  if (method === "get" && id) {
    const item = find(name, id);
    return item ? reply(config, 200, item) : reply(config, 404, {});
  }

  if (method === "get") {
    const { _sort, _order, _limit, ...filters } = query;
    let items = sortItems(where(name, filters), _sort, _order);
    if (_limit) items = items.slice(0, Number(_limit));
    return reply(config, 200, items);
  }

  if (method === "post") {
    collection(name);
    return reply(config, 201, insert(name, body));
  }

  if (method === "patch" || method === "put") {
    const item = update(name, id, body);
    return item ? reply(config, 200, item) : reply(config, 404, {});
  }

  return reply(config, 405, {});
};

export const paymentAdapter = async (config) => {
  const { path, query, body, method } = parse(config);
  try {
    const data = await handlePaymentRequest({ path, query, body, method });
    return reply(config, 200, data);
  } catch (err) {
    return reply(config, err.status ?? 500, { error: err.message, ...err.extra });
  }
};
