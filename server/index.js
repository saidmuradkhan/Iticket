// Ödəniş backend-i. Payriff secret key yalnız burada saxlanılır.
// İşə salmaq: npm run payment
import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import {
  createOrder as payriffCreateOrder,
  getOrderInformation,
  refund as payriffRefund,
  hasCredentials,
  PayriffError,
  STATUS_APPROVED,
} from "./payriff.js";

const PORT = Number(process.env.PAYMENT_PORT) || 3002;
const DB_URL = process.env.JSON_SERVER_URL || "http://localhost:3001";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

const app = express();
app.use(cors());
app.use(express.json());
// Payriff callback-i form formatında da göndərə bilər
app.use(express.urlencoded({ extended: false }));

/* ───────── json-server köməkçiləri ───────── */

class NotFoundError extends Error {}

class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.extra = extra;
  }
}

const dbGet = async (path, notFoundMessage = "Sifariş tapılmadı") => {
  const res = await fetch(`${DB_URL}${path}`);
  if (res.status === 404) throw new NotFoundError(notFoundMessage);
  if (!res.ok) throw new Error(`json-server ${res.status}: ${path}`);
  return res.json();
};

const dbPatch = async (path, body) => {
  const res = await fetch(`${DB_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`json-server ${res.status}: ${path}`);
  return res.json();
};

const dbPost = async (path, body) => {
  const res = await fetch(`${DB_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`json-server ${res.status}: ${path}`);
  return res.json();
};

/* ───────── status uyğunlaşdırma ───────── */

// Payriff paymentStatus -> bizim daxili status
const mapPaymentStatus = (paymentStatus) => {
  switch (paymentStatus) {
    case STATUS_APPROVED:
    case "PREAUTH_APPROVED":
      return "confirmed";
    case "DECLINED":
      return "declined";
    case "CANCELED":
    case "CANCELLED":
      return "canceled";
    case "EXPIRED":
      return "expired";
    case "REFUNDED":
    case "PARTIAL_REFUND":
      return "refunded";
    default:
      return "pending_payment";
  }
};

/**
 * Payriff-dən sifarişin vəziyyətini oxuyur və db.json-u yeniləyir.
 * Idempotentdir — həm redirect, həm də callback bunu çağıra bilər.
 */
const syncOrderStatus = async (order) => {
  const payriffOrderId = order.payment?.payriffOrderId;
  if (!payriffOrderId) {
    return { status: order.status, paymentStatus: null };
  }

  // artıq tamamlanmış sifarişi təkrar sorğulamağa ehtiyac yoxdur
  if (order.status === "confirmed" || order.status === "refunded") {
    return { status: order.status, paymentStatus: order.payment?.paymentStatus ?? null };
  }

  const info = await getOrderInformation(payriffOrderId);
  const status = mapPaymentStatus(info.paymentStatus);

  const patch = {
    status,
    payment: {
      ...order.payment,
      paymentStatus: info.paymentStatus,
      amount: info.amount,
      currency: info.currencyType,
      verifiedAt: new Date().toISOString(),
    },
  };

  // ödəniş uğurludursa sifarişdə ödəniş üsulunu da qeyd edirik
  if (status === "confirmed") patch.paymentMethod = "online";

  await dbPatch(`/orders/${order.id}`, patch);

  return { status, paymentStatus: info.paymentStatus };
};

/* ───────── endpoint-lər ───────── */

app.get("/api/payment/health", (req, res) => {
  res.json({ ok: true, credentials: hasCredentials() });
});

/**
 * Ödənişə başlayır: Payriff-də order açır, paymentUrl qaytarır.
 * Frontend istifadəçini həmin ünvana yönləndirir.
 */
app.post("/api/payment/create", async (req, res, next) => {
  try {
    const { orderId, language = "AZ" } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId tələb olunur" });
    }

    const order = await dbGet(`/orders/${orderId}`);

    if (order.status === "confirmed") {
      return res.status(409).json({ error: "Bu sifariş artıq ödənilib" });
    }
    if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
      await dbPatch(`/orders/${orderId}`, { status: "expired" });
      return res.status(409).json({ error: "Ödəniş vaxtı bitdi" });
    }
    if (!(order.totalPrice > 0)) {
      return res.status(400).json({ error: "Sifarişin məbləği düzgün deyil" });
    }

    const description =
      order.items?.length === 1
        ? `İticket — ${order.items[0].eventTitle}`
        : `İticket — ${order.items?.length ?? 0} bilet`;

    const payload = await payriffCreateOrder({
      amount: order.totalPrice,
      description,
      language,
      // Payriff ödənişdən sonra istifadəçini bu ünvana qaytarır
      callbackUrl: `${APP_URL}/payment/result?orderId=${encodeURIComponent(orderId)}`,
    });

    await dbPatch(`/orders/${orderId}`, {
      payment: {
        provider: "payriff",
        payriffOrderId: payload.orderId,
        transactionId: payload.transactionId,
        paymentUrl: payload.paymentUrl,
        startedAt: new Date().toISOString(),
      },
    });

    res.json({ paymentUrl: payload.paymentUrl, payriffOrderId: payload.orderId });
  } catch (err) {
    next(err);
  }
});

/**
 * Ödənişin nəticəsini Payriff-dən yoxlayır (redirect-dən sonra frontend çağırır).
 * Brauzerdən gələn məlumata güvənmirik — həmişə Payriff-dən soruşuruq.
 */
app.get("/api/payment/verify/:orderId", async (req, res, next) => {
  try {
    const order = await dbGet(`/orders/${req.params.orderId}`);
    const result = await syncOrderStatus(order);
    res.json({ orderId: order.id, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * Payriff-in server-to-server bildirişi.
 * Gövdəyə güvənmirik — sadəcə siqnal kimi qəbul edib statusu API-dən yoxlayırıq.
 * Qeyd: localhost-da Payriff bura çata bilmir, real domendə işləyir.
 */
app.post("/api/payment/callback", async (req, res) => {
  const orderId = req.query.orderId || req.body?.orderId;
  try {
    if (orderId) {
      const order = await dbGet(`/orders/${orderId}`);
      await syncOrderStatus(order);
    }
  } catch (err) {
    console.error("[payriff] callback xətası:", err.message);
  }
  res.sendStatus(200);
});

app.post("/api/payment/refund", async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId tələb olunur" });
    }

    const order = await dbGet(`/orders/${orderId}`);

    if (await isWalletPaid(order)) {
      return res.json(await refundToWallet(order, amount));
    }

    const result = await withWalletLock(`order-${orderId}`, async () => {
      const current = await dbGet(`/orders/${orderId}`);

      if (!current.payment?.payriffOrderId) {
        throw new HttpError(400, "Bu sifarişdə Payriff ödənişi yoxdur");
      }
      if (current.status === "refunded") {
        throw new HttpError(409, "Bu sifariş artıq geri qaytarılıb");
      }
      if (current.status !== "confirmed") {
        throw new HttpError(409, "Yalnız ödənilmiş sifariş geri qaytarıla bilər");
      }

      const value = round(amount ?? current.totalPrice);
      if (!(value > 0) || value > round(current.totalPrice)) {
        throw new HttpError(400, `Geri qaytarıla bilən məbləğ: ${round(current.totalPrice)} ₼`);
      }

      await payriffRefund({
        payriffOrderId: current.payment.payriffOrderId,
        amount: value,
      });

      await dbPatch(`/orders/${orderId}`, {
        status: "refunded",
        payment: {
          ...current.payment,
          paymentStatus: "REFUNDED",
          refundedAt: new Date().toISOString(),
        },
      });

      return { ok: true, status: "refunded", amount: value };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/* ───────── cüzdan (balans artırma) ───────── */

const MIN_TOPUP = 1;
const MAX_TOPUP = 5000;

const walletLocks = new Map();

const withWalletLock = (key, fn) => {
  const previous = walletLocks.get(key) ?? Promise.resolve();
  const current = previous.then(fn, fn);
  const released = current.catch(() => {}).finally(() => {
    if (walletLocks.get(key) === released) walletLocks.delete(key);
  });
  walletLocks.set(key, released);
  return current;
};

const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < MIN_TOPUP || amount > MAX_TOPUP) return null;
  return Number(amount.toFixed(2));
};

const round = (value) => Number(Number(value).toFixed(2));

const normalizeId = (value) =>
  /^\d+$/.test(String(value)) ? Number(value) : String(value);

const getTransactions = (userId) =>
  dbGet(`/walletTransactions?userId=${encodeURIComponent(userId)}`);

const getBalance = async (userId) =>
  round(
    (await getTransactions(userId)).reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    )
  );

const findTopup = async (ref) => {
  const found = await dbGet(`/topups?ref=${encodeURIComponent(ref)}`);
  if (found.length === 0) {
    throw new NotFoundError("Balans artırma sorğusu tapılmadı");
  }
  return found[0];
};

const syncTopupStatus = async (ref) =>
  withWalletLock(`topup-${ref}`, async () => {
    const topup = await findTopup(ref);

    const info = await getOrderInformation(topup.payment.payriffOrderId);
    const status = mapPaymentStatus(info.paymentStatus);
    let amount = topup.amount;

    if (status === "confirmed") {
      const credited = await dbGet(
        `/walletTransactions?ref=${encodeURIComponent(ref)}`
      );

      if (credited.length === 0) {
        amount = parseAmount(info.amount) ?? topup.amount;
        if (amount !== topup.amount) {
          console.warn(
            `[wallet] ${ref}: gözlənilən ${topup.amount}, ödənilən ${amount}`
          );
        }

        await dbPost("/walletTransactions", {
          userId: normalizeId(topup.userId),
          ref,
          type: "topup",
          amount,
          createdAt: new Date().toISOString(),
        });
      } else {
        amount = credited[0].amount;
      }
    }

    if (topup.status !== status) {
      await dbPatch(`/topups/${topup.id}`, {
        status,
        payment: {
          ...topup.payment,
          paymentStatus: info.paymentStatus,
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    return { status, amount, balance: await getBalance(topup.userId) };
  });

app.get("/api/wallet/:userId", async (req, res, next) => {
  try {
    res.json({ userId: req.params.userId, balance: await getBalance(req.params.userId) });
  } catch (err) {
    next(err);
  }
});

app.post("/api/wallet/topup/create", async (req, res, next) => {
  try {
    const { userId, amount, language = "AZ" } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId tələb olunur" });
    }

    const value = parseAmount(amount);
    if (value === null) {
      return res
        .status(400)
        .json({ error: `Məbləğ ${MIN_TOPUP}–${MAX_TOPUP} ₼ aralığında olmalıdır` });
    }

    const ref = `tu-${randomUUID()}`;

    const payload = await payriffCreateOrder({
      amount: value,
      description: `İticket — cüzdan balansının artırılması (${value} AZN)`,
      language,
      callbackUrl: `${APP_URL}/payment/result?topupRef=${encodeURIComponent(ref)}`,
    });

    await dbPost("/topups", {
      ref,
      userId: normalizeId(userId),
      amount: value,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
      payment: {
        provider: "payriff",
        payriffOrderId: payload.orderId,
        transactionId: payload.transactionId,
        paymentUrl: payload.paymentUrl,
        startedAt: new Date().toISOString(),
      },
    });

    res.json({ ref, amount: value, paymentUrl: payload.paymentUrl });
  } catch (err) {
    next(err);
  }
});

app.get("/api/wallet/topup/verify/:ref", async (req, res, next) => {
  try {
    const result = await syncTopupStatus(req.params.ref);
    res.json({ ref: req.params.ref, ...result });
  } catch (err) {
    next(err);
  }
});

app.post("/api/wallet/topup/callback", async (req, res) => {
  const ref = req.query.topupRef || req.body?.ref;
  try {
    if (ref) await syncTopupStatus(ref);
  } catch (err) {
    console.error("[wallet] callback xətası:", err.message);
  }
  res.sendStatus(200);
});
app.post("/api/wallet/pay", async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "orderId tələb olunur" });
    }

    const result = await withWalletLock(`order-${orderId}`, async () => {
      const order = await dbGet(`/orders/${orderId}`);
      const ref = `order-${orderId}`;

      const spent = await dbGet(`/walletTransactions?ref=${encodeURIComponent(ref)}`);
      if (spent.length > 0) {
        if (order.status !== "confirmed") {
          await dbPatch(`/orders/${orderId}`, {
            status: "confirmed",
            paymentMethod: "wallet",
          });
        }
        return { status: "confirmed", balance: await getBalance(order.userId) };
      }

      if (order.status === "confirmed") {
        throw new HttpError(409, "Bu sifariş artıq ödənilib");
      }
      if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
        await dbPatch(`/orders/${orderId}`, { status: "expired" });
        throw new HttpError(409, "Ödəniş vaxtı bitdi");
      }

      const total = round(order.totalPrice);
      if (!(total > 0)) {
        throw new HttpError(400, "Sifarişin məbləği düzgün deyil");
      }

      const balance = await getBalance(order.userId);
      if (balance < total) {
        throw new HttpError(409, "Cüzdanda kifayət qədər vəsait yoxdur", { balance });
      }

      await dbPost("/walletTransactions", {
        userId: normalizeId(order.userId),
        ref,
        orderId: normalizeId(orderId),
        type: "purchase",
        amount: -total,
        createdAt: new Date().toISOString(),
      });

      await dbPatch(`/orders/${orderId}`, {
        status: "confirmed",
        paymentMethod: "wallet",
      });

      return { status: "confirmed", balance: round(balance - total) };
    });

    res.json({ orderId, ...result });
  } catch (err) {
    next(err);
  }
});

const findWalletPurchase = async (orderId) => {
  const found = await dbGet(
    `/walletTransactions?ref=${encodeURIComponent(`order-${orderId}`)}`
  );
  return found[0] ?? null;
};

const isWalletPaid = async (order) =>
  order.paymentMethod === "wallet" || Boolean(await findWalletPurchase(order.id));

const refundToWallet = (order, requested) =>
  withWalletLock(`order-${order.id}`, async () => {
    const purchase = await findWalletPurchase(order.id);
    if (!purchase) {
      throw new HttpError(400, "Bu sifariş cüzdandan ödənilməyib");
    }

    const paid = round(Math.abs(purchase.amount));
    const history = await dbGet(
      `/walletTransactions?orderId=${encodeURIComponent(order.id)}`
    );
    const refunds = history.filter((item) => item.type === "refund");
    const refunded = round(
      refunds.reduce((total, item) => total + Number(item.amount || 0), 0)
    );
    const remaining = round(paid - refunded);

    if (remaining <= 0) {
      throw new HttpError(409, "Bu sifariş artıq geri qaytarılıb");
    }

    const value = requested === undefined || requested === null ? remaining : round(requested);
    if (!(value > 0) || value > remaining) {
      throw new HttpError(400, `Geri qaytarıla bilən məbləğ: ${remaining} ₼`);
    }

    await dbPost("/walletTransactions", {
      userId: normalizeId(order.userId),
      ref: `refund-order-${order.id}-${refunds.length + 1}`,
      orderId: normalizeId(order.id),
      type: "refund",
      amount: value,
      createdAt: new Date().toISOString(),
    });

    const status = round(refunded + value) >= paid ? "refunded" : order.status;
    if (status !== order.status) {
      await dbPatch(`/orders/${order.id}`, {
        status,
        refundedAt: new Date().toISOString(),
      });
    }

    return {
      ok: true,
      status,
      amount: value,
      refunded: round(refunded + value),
      balance: await getBalance(order.userId),
    };
  });

app.use((err, req, res, next) => {
  console.error(`[payment] ${err.name}: ${err.message}`);

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof PayriffError) {
    return res.status(502).json({ error: err.message });
  }
  res.status(500).json({ error: "Server xətası" });
});

app.listen(PORT, () => {
  console.log(`[payment] http://localhost:${PORT} — Payriff ${hasCredentials() ? "aktiv" : "SECRET KEY YOXDUR"}`);
});
