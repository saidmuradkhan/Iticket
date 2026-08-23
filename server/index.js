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
  // Payriff təkrar cəhd etməsin deyə hər halda 200 qaytarırıq
  res.sendStatus(200);
});

/** Ödənişi geri qaytarır. */
app.post("/api/payment/refund", async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    const order = await dbGet(`/orders/${orderId}`);

    if (!order.payment?.payriffOrderId) {
      return res.status(400).json({ error: "Bu sifarişdə Payriff ödənişi yoxdur" });
    }
    if (order.status !== "confirmed") {
      return res.status(409).json({ error: "Yalnız ödənilmiş sifariş geri qaytarıla bilər" });
    }

    await payriffRefund({
      payriffOrderId: order.payment.payriffOrderId,
      amount: amount ?? order.totalPrice,
    });

    await dbPatch(`/orders/${orderId}`, {
      status: "refunded",
      payment: {
        ...order.payment,
        paymentStatus: "REFUNDED",
        refundedAt: new Date().toISOString(),
      },
    });

    res.json({ ok: true, status: "refunded" });
  } catch (err) {
    next(err);
  }
});

/* ───────── cüzdan (balans artırma) ───────── */

const MIN_TOPUP = 1;
const MAX_TOPUP = 5000;

// json-server eyni topup üçün paralel yoxlamaları (redirect + callback)
// bir-bir növbəyə salırıq ki, balansa iki qeyd düşməsin
const topupLocks = new Map();

const withTopupLock = (key, fn) => {
  const previous = topupLocks.get(key) ?? Promise.resolve();
  const current = previous.then(fn, fn);
  const released = current.catch(() => {}).finally(() => {
    if (topupLocks.get(key) === released) topupLocks.delete(key);
  });
  topupLocks.set(key, released);
  return current;
};

const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < MIN_TOPUP || amount > MAX_TOPUP) return null;
  return Number(amount.toFixed(2));
};

const round = (value) => Number(Number(value).toFixed(2));

// json-server sorğu parametrini rəqəmə çevirib ciddi müqayisə edir:
// "1" saxlanılsa, ?userId=1 filtri tutmur (orders da rəqəm saxlayır)
const normalizeUserId = (value) =>
  /^\d+$/.test(String(value)) ? Number(value) : String(value);

// Balans ayrıca sahədə saxlanmır — əməliyyatların cəmidir.
// Belədə balansın artırılması bir yazıdan ibarətdir və ikiqat hesablanma olmur.
const getTransactions = (userId) =>
  dbGet(`/walletTransactions?userId=${encodeURIComponent(userId)}`);

const getBalance = async (userId) =>
  round(
    (await getTransactions(userId)).reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    )
  );

// json-server POST-da öz id-sini yaradır və onu qabaqcadan bilmək olmur,
// ona görə qeydi öz istinadımızla (ref) tapırıq
const findTopup = async (ref) => {
  const found = await dbGet(`/topups?ref=${encodeURIComponent(ref)}`);
  if (found.length === 0) {
    throw new NotFoundError("Balans artırma sorğusu tapılmadı");
  }
  return found[0];
};

/**
 * Ödənişi Payriff-dən yoxlayır və uğurludursa balansa BİR DƏFƏ yazır.
 * Həm redirect, həm callback bunu çağıra bilər — ona görə idempotentdir:
 * eyni ödəniş üçün ikinci əməliyyat qeydi yaradılmır.
 */
const syncTopupStatus = async (ref) =>
  withTopupLock(ref, async () => {
    // kilid növbəsində gözləyərkən vəziyyət dəyişə bilər, ona görə təzədən oxuyuruq
    const topup = await findTopup(ref);

    const info = await getOrderInformation(topup.payment.payriffOrderId);
    const status = mapPaymentStatus(info.paymentStatus);
    let amount = topup.amount;

    if (status === "confirmed") {
      const credited = await dbGet(
        `/walletTransactions?ref=${encodeURIComponent(ref)}`
      );

      if (credited.length === 0) {
        // balansı bankın təsdiqlədiyi məbləğlə artırırıq, sorğudakı ilə deyil
        amount = parseAmount(info.amount) ?? topup.amount;
        if (amount !== topup.amount) {
          console.warn(
            `[wallet] ${ref}: gözlənilən ${topup.amount}, ödənilən ${amount}`
          );
        }

        await dbPost("/walletTransactions", {
          userId: normalizeUserId(topup.userId),
          ref,
          type: "topup",
          amount,
          createdAt: new Date().toISOString(),
        });
      } else {
        amount = credited[0].amount;
      }
    }

    // status qeydi köməkçidir — itsə də balans əməliyyatlardan hesablanır
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

/** Cüzdanın balansı. */
app.get("/api/wallet/:userId", async (req, res, next) => {
  try {
    res.json({ userId: req.params.userId, balance: await getBalance(req.params.userId) });
  } catch (err) {
    next(err);
  }
});

/** Balans artırma üçün Payriff-də ödəniş açır. */
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

    // istinadı özümüz yaradırıq: callbackUrl ödəniş açılmazdan əvvəl lazımdır,
    // qeyd isə sonra bir yazı ilə saxlanılır
    const ref = `tu-${randomUUID()}`;

    const payload = await payriffCreateOrder({
      amount: value,
      description: `İticket — cüzdan balansının artırılması (${value} AZN)`,
      language,
      callbackUrl: `${APP_URL}/payment/result?topupRef=${encodeURIComponent(ref)}`,
    });

    await dbPost("/topups", {
      ref,
      userId: normalizeUserId(userId),
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

/** Balans artırmanın nəticəsini Payriff-dən yoxlayır. */
app.get("/api/wallet/topup/verify/:ref", async (req, res, next) => {
  try {
    const result = await syncTopupStatus(req.params.ref);
    res.json({ ref: req.params.ref, ...result });
  } catch (err) {
    next(err);
  }
});

/** Payriff-in balans artırma üçün server bildirişi. */
app.post("/api/wallet/topup/callback", async (req, res) => {
  const ref = req.query.topupRef || req.body?.ref;
  try {
    if (ref) await syncTopupStatus(ref);
  } catch (err) {
    console.error("[wallet] callback xətası:", err.message);
  }
  res.sendStatus(200);
});

/* ───────── xəta emalı ───────── */

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[payment] ${err.name}: ${err.message}`);

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
