import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
});

export const getEvents = () => api.get("/events");
export const getShows = () => api.get("/shows");
export const getEventById = (id) => api.get(`/events/${id}`);
export const getShowById = (id) => api.get(`/shows/${id}`);

export const getEventOrShowById = async (id) => {
  try {
    const res = await getEventById(id);
    return res.data;
  } catch {
    const res = await getShowById(id);
    return res.data;
  }
};

export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}`, { read: true });

// userId bəzi sifarişlərdə rəqəm (1), bəzilərində mətn ("1") kimi saxlanılıb.
// json-server ?userId=1 sorğusunu ancaq eyni tipə uyğunlaşdırdığı üçün
// yarısı düşür — ona görə hamısını çəkib müqayisəni String ilə edirik.
export const getOrders = async (userId) => {
  const res = await api.get("/orders");
  const data = res.data.filter(
    (order) => String(order.userId) === String(userId)
  );
  return { data };
};
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (order) => api.post("/orders", order);
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}`, { status });

export const login = (email) => api.get(`/users?email=${email}`);

export const getWalletTransactions = (userId) =>
  api.get(`/walletTransactions?userId=${userId}&_sort=-createdAt`);
