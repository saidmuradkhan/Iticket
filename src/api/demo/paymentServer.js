import { collection, find, insert, remove, update, where } from "./store";
import {
  createPayriffOrder,
  getPayriffStatus,
  mapPaymentStatus,
  payriffAvailable,
  refundPayriffOrder,
} from "./payriffGateway";

const SEAT_HOLD_MINUTES = 15;
const MIN_TOPUP = 1;
const MAX_TOPUP = 5000;
const WELCOME_BALANCE = 150;

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const now = () => new Date().toISOString();
const round = (value) => Number(Number(value).toFixed(2));
const sameId = (a, b) => String(a) === String(b);

const getOrder = (id) => {
  const order = find("orders", id);
  if (!order) throw new HttpError(404, "Sifariş tapılmadı");
  return order;
};

const isHoldActive = (hold) => {
  if (hold.status === "sold") return true;
  if (hold.status !== "held") return false;
  return Boolean(hold.expiresAt) && new Date(hold.expiresAt).getTime() > Date.now();
};

const holdExpiry = () => new Date(Date.now() + SEAT_HOLD_MINUTES * 60 * 1000).toISOString();

const purgeExpiredHolds = () => {
  const stale = collection("seatHolds").filter((h) => h.status === "held" && !isHoldActive(h));
  stale.forEach((h) => remove("seatHolds", h.id));
};

const seatKeysOf = (order) => (order.items || []).map((i) => i.seatInfo?.seatKey).filter(Boolean);

const finalizeSeats = (order) => {
  for (const item of (order.items || []).filter((i) => i.seatInfo?.seatKey)) {
    const key = item.seatInfo.seatKey;
    const existing = where("seatHolds", { seatKey: key });
    if (existing.some((h) => h.status === "sold")) continue;
    existing.filter((h) => h.status === "held").forEach((h) => remove("seatHolds", h.id));
    insert("seatHolds", {
      eventId: String(item.eventId ?? item.seatInfo.eventId ?? ""),
      seatKey: key,
      userId: order.userId ?? null,
      status: "sold",
      orderId: order.id,
      expiresAt: null,
      createdAt: now(),
    });
  }
};

const releaseSeats = (order) => {
  const keys = seatKeysOf(order);
  collection("seatHolds")
    .filter((h) => h.status === "held" && keys.includes(h.seatKey) && sameId(h.userId, order.userId))
    .forEach((h) => remove("seatHolds", h.id));
};

const ensurePayable = (order) => {
  if (order.status === "confirmed") throw new HttpError(409, "Bu sifariş artıq ödənilib");
  if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
    update("orders", order.id, { status: "expired" });
    releaseSeats(order);
    throw new HttpError(409, "Ödəniş vaxtı bitdi");
  }
  if (!(order.totalPrice > 0)) throw new HttpError(400, "Sifarişin məbləği düzgün deyil");
};

const ensureWelcomeBalance = (userId) => {
  if (where("walletTransactions", { userId }).length > 0) return;
  insert("walletTransactions", {
    userId,
    ref: `welcome-${userId}`,
    type: "topup",
    amount: WELCOME_BALANCE,
    createdAt: now(),
  });
};

const balanceOf = (userId) => {
  ensureWelcomeBalance(userId);
  return round(where("walletTransactions", { userId }).reduce((sum, t) => sum + Number(t.amount || 0), 0));
};

const walletPurchase = (orderId) => where("walletTransactions", { ref: `order-${orderId}` })[0] ?? null;

const orderDescription = (order) =>
  order.items?.length === 1
    ? `İticket — ${order.items[0].eventTitle}`
    : `İticket — ${order.items?.length ?? 0} bilet`;

const startCheckout = async ({ amount, description, returnPath, language }) => {
  if (await payriffAvailable()) {
    const payload = await createPayriffOrder({ amount, description, returnPath, language });
    return {
      paymentUrl: payload.paymentUrl,
      payment: {
        provider: "payriff",
        payriffOrderId: payload.orderId,
        transactionId: payload.transactionId,
        paymentUrl: payload.paymentUrl,
        startedAt: now(),
      },
    };
  }
  return {
    paymentUrl: returnPath,
    payment: { provider: "demo", payriffOrderId: `demo-${Date.now()}`, paymentUrl: returnPath, startedAt: now() },
  };
};

const checkPayment = async (payment) => {
  if (payment.provider !== "payriff") return { status: "confirmed", paymentStatus: "APPROVED" };
  const info = await getPayriffStatus(payment.payriffOrderId);
  return { status: mapPaymentStatus(info.paymentStatus), paymentStatus: info.paymentStatus, amount: info.amount };
};

const createPayment = async ({ orderId, language = "AZ" }) => {
  if (!orderId) throw new HttpError(400, "orderId tələb olunur");
  const order = getOrder(orderId);
  ensurePayable(order);
  const { paymentUrl, payment } = await startCheckout({
    amount: round(order.totalPrice),
    description: orderDescription(order),
    returnPath: `/payment/result?orderId=${encodeURIComponent(orderId)}`,
    language,
  });
  update("orders", orderId, { payment });
  return { paymentUrl, payriffOrderId: payment.payriffOrderId };
};

const verifyPayment = async (orderId) => {
  const order = getOrder(orderId);
  if (!order.payment?.payriffOrderId) return { orderId, status: order.status, paymentStatus: null };
  if (order.status === "confirmed" || order.status === "refunded") {
    return { orderId, status: order.status, paymentStatus: order.payment.paymentStatus ?? "APPROVED" };
  }
  const { status, paymentStatus } = await checkPayment(order.payment);
  update("orders", orderId, {
    status,
    ...(status === "confirmed" ? { paymentMethod: "online" } : {}),
    payment: { ...order.payment, paymentStatus, amount: order.totalPrice, currency: "AZN", verifiedAt: now() },
  });
  if (status === "confirmed") finalizeSeats(order);
  if (["expired", "canceled", "declined"].includes(status)) releaseSeats(order);
  return { orderId, status, paymentStatus };
};

const refundToWallet = (order, requested) => {
  const purchase = walletPurchase(order.id);
  if (!purchase) throw new HttpError(400, "Bu sifariş cüzdandan ödənilməyib");
  const paid = round(Math.abs(purchase.amount));
  const refunds = where("walletTransactions", { orderId: order.id }).filter((t) => t.type === "refund");
  const refunded = round(refunds.reduce((sum, t) => sum + Number(t.amount || 0), 0));
  const remaining = round(paid - refunded);
  if (remaining <= 0) throw new HttpError(409, "Bu sifariş artıq geri qaytarılıb");
  const value = requested == null ? remaining : round(requested);
  if (!(value > 0) || value > remaining) throw new HttpError(400, `Geri qaytarıla bilən məbləğ: ${remaining} ₼`);
  insert("walletTransactions", {
    userId: order.userId,
    ref: `refund-order-${order.id}-${refunds.length + 1}`,
    orderId: order.id,
    type: "refund",
    amount: value,
    createdAt: now(),
  });
  const status = round(refunded + value) >= paid ? "refunded" : order.status;
  if (status !== order.status) update("orders", order.id, { status, refundedAt: now() });
  return { ok: true, status, amount: value, refunded: round(refunded + value), balance: balanceOf(order.userId) };
};

const refundPayment = async ({ orderId, amount }) => {
  if (!orderId) throw new HttpError(400, "orderId tələb olunur");
  const order = getOrder(orderId);
  if (order.paymentMethod === "wallet" || walletPurchase(order.id)) return refundToWallet(order, amount);
  if (!order.payment?.payriffOrderId) throw new HttpError(400, "Bu sifarişdə onlayn ödəniş yoxdur");
  if (order.status === "refunded") throw new HttpError(409, "Bu sifariş artıq geri qaytarılıb");
  if (order.status !== "confirmed") throw new HttpError(409, "Yalnız ödənilmiş sifariş geri qaytarıla bilər");
  const value = round(amount ?? order.totalPrice);
  if (!(value > 0) || value > round(order.totalPrice)) {
    throw new HttpError(400, `Geri qaytarıla bilən məbləğ: ${round(order.totalPrice)} ₼`);
  }
  if (order.payment.provider === "payriff") {
    await refundPayriffOrder({ payriffOrderId: order.payment.payriffOrderId, amount: value });
  }
  update("orders", orderId, {
    status: "refunded",
    payment: { ...order.payment, paymentStatus: "REFUNDED", refundedAt: now() },
  });
  return { ok: true, status: "refunded", amount: value };
};

const createTopup = async ({ userId, amount, language = "AZ" }) => {
  if (!userId) throw new HttpError(400, "userId tələb olunur");
  const value = Number(amount);
  if (!Number.isFinite(value) || value < MIN_TOPUP || value > MAX_TOPUP) {
    throw new HttpError(400, `Məbləğ ${MIN_TOPUP}–${MAX_TOPUP} ₼ aralığında olmalıdır`);
  }
  ensureWelcomeBalance(userId);
  const ref = `tu-${Date.now().toString(36)}`;
  const { paymentUrl, payment } = await startCheckout({
    amount: round(value),
    description: `İticket — cüzdan balansının artırılması (${round(value)} AZN)`,
    returnPath: `/payment/result?topupRef=${encodeURIComponent(ref)}`,
    language,
  });
  insert("topups", { ref, userId, amount: round(value), status: "pending_payment", createdAt: now(), payment });
  return { ref, amount: round(value), paymentUrl };
};

const verifyTopup = async (ref) => {
  const topup = where("topups", { ref })[0];
  if (!topup) throw new HttpError(404, "Balans artırma sorğusu tapılmadı");
  const { status, paymentStatus } =
    topup.status === "confirmed" ? { status: "confirmed", paymentStatus: "APPROVED" } : await checkPayment(topup.payment);
  if (status === "confirmed" && where("walletTransactions", { ref }).length === 0) {
    insert("walletTransactions", { userId: topup.userId, ref, type: "topup", amount: topup.amount, createdAt: now() });
  }
  if (topup.status !== status) {
    update("topups", topup.id, { status, payment: { ...topup.payment, paymentStatus, verifiedAt: now() } });
  }
  return { ref, status, amount: topup.amount, balance: balanceOf(topup.userId) };
};

const payWithWallet = ({ orderId }) => {
  if (!orderId) throw new HttpError(400, "orderId tələb olunur");
  const order = getOrder(orderId);
  if (walletPurchase(orderId)) {
    if (order.status !== "confirmed") update("orders", orderId, { status: "confirmed", paymentMethod: "wallet" });
    finalizeSeats(order);
    return { orderId, status: "confirmed", balance: balanceOf(order.userId) };
  }
  ensurePayable(order);
  const total = round(order.totalPrice);
  const balance = balanceOf(order.userId);
  if (balance < total) throw new HttpError(409, "Cüzdanda kifayət qədər vəsait yoxdur", { balance });
  insert("walletTransactions", {
    userId: order.userId,
    ref: `order-${orderId}`,
    orderId,
    type: "purchase",
    amount: -total,
    createdAt: now(),
  });
  update("orders", orderId, { status: "confirmed", paymentMethod: "wallet" });
  finalizeSeats(order);
  return { orderId, status: "confirmed", balance: round(balance - total) };
};

const seatStatus = (eventId, userId) => {
  purgeExpiredHolds();
  const taken = collection("seatHolds")
    .filter((h) => sameId(h.eventId, eventId) && isHoldActive(h))
    .map((h) => ({
      seatKey: h.seatKey,
      status: h.status,
      mine: userId != null && sameId(h.userId, userId),
      expiresAt: h.expiresAt,
    }));
  return { eventId: String(eventId), taken };
};

const holdSeat = ({ eventId, seatKey, userId }) => {
  if (!eventId || !seatKey || userId == null) throw new HttpError(400, "eventId, seatKey və userId tələb olunur");
  const all = where("seatHolds", { seatKey });
  const active = all.filter(isHoldActive);
  if (active.some((h) => !sameId(h.userId, userId))) throw new HttpError(409, "Bu yer artıq tutulub");
  const mine = active.find((h) => sameId(h.userId, userId));
  if (mine) {
    if (mine.status !== "held") return { seatKey, status: "sold", expiresAt: null };
    const expiresAt = holdExpiry();
    update("seatHolds", mine.id, { expiresAt });
    return { seatKey, status: "held", expiresAt };
  }
  all.filter((h) => sameId(h.userId, userId) && !isHoldActive(h)).forEach((h) => remove("seatHolds", h.id));
  const expiresAt = holdExpiry();
  const created = insert("seatHolds", { eventId: String(eventId), seatKey, userId, status: "held", expiresAt, createdAt: now() });
  return { seatKey, status: "held", expiresAt, id: created.id };
};

const releaseSeat = ({ seatKey, userId }) => {
  if (!seatKey || userId == null) throw new HttpError(400, "seatKey və userId tələb olunur");
  where("seatHolds", { seatKey })
    .filter((h) => sameId(h.userId, userId) && h.status === "held")
    .forEach((h) => remove("seatHolds", h.id));
  return { ok: true };
};

const routes = [
  ["get", /^\/api\/payment\/health$/, async () => ({ ok: true, credentials: await payriffAvailable() })],
  ["post", /^\/api\/payment\/create$/, ({ body }) => createPayment(body)],
  ["get", /^\/api\/payment\/verify\/(.+)$/, (_, [orderId]) => verifyPayment(orderId)],
  ["post", /^\/api\/payment\/refund$/, ({ body }) => refundPayment(body)],
  ["get", /^\/api\/wallet\/topup\/verify\/(.+)$/, (_, [ref]) => verifyTopup(ref)],
  ["post", /^\/api\/wallet\/topup\/create$/, ({ body }) => createTopup(body)],
  ["post", /^\/api\/wallet\/pay$/, ({ body }) => payWithWallet(body)],
  ["get", /^\/api\/wallet\/([^/]+)$/, (_, [userId]) => ({ userId, balance: balanceOf(userId) })],
  ["post", /^\/api\/seats\/hold$/, ({ body }) => holdSeat(body)],
  ["post", /^\/api\/seats\/release$/, ({ body }) => releaseSeat(body)],
  ["get", /^\/api\/seats\/([^/]+)$/, ({ query }, [eventId]) => seatStatus(eventId, query.userId ?? null)],
];

export const handlePaymentRequest = async (request) => {
  for (const [method, pattern, handler] of routes) {
    const match = request.path.match(pattern);
    if (method === request.method && match) {
      return handler(request, match.slice(1).map(decodeURIComponent));
    }
  }
  throw new HttpError(404, "Not found");
};
