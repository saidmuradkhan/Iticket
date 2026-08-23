import axios from "axios";

// Ödəniş backend-i (server/index.js) — npm run payment
export const paymentApi = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_API || "http://localhost:3002",
});

// backend-dən gələn xəta mətnini çıxarır
const extractError = (err) =>
  err.response?.data?.error || "Ödəniş serverinə qoşulmaq mümkün olmadı";

/** Payriff-də ödəniş açır və paymentUrl qaytarır. */
export const startPayment = async (orderId, language = "AZ") => {
  try {
    const res = await paymentApi.post("/api/payment/create", { orderId, language });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

/** Ödənişin nəticəsini serverdə yoxlayır. */
export const verifyPayment = async (orderId) => {
  try {
    const res = await paymentApi.get(`/api/payment/verify/${orderId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

/** Ödənişi geri qaytarır. */
export const refundPayment = async (orderId, amount) => {
  try {
    const res = await paymentApi.post("/api/payment/refund", { orderId, amount });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};
