import axios from "axios";

export const paymentApi = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_API || "http://localhost:3002",
});

const extractError = (err) =>
  err.response?.data?.error || "Ödəniş serverinə qoşulmaq mümkün olmadı";

export const startPayment = async (orderId, language = "AZ") => {
  try {
    const res = await paymentApi.post("/api/payment/create", { orderId, language });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

export const verifyPayment = async (orderId) => {
  try {
    const res = await paymentApi.get(`/api/payment/verify/${orderId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

export const refundPayment = async (orderId, amount) => {
  try {
    const res = await paymentApi.post("/api/payment/refund", { orderId, amount });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

export const getWalletBalance = async (userId) => {
  try {
    const res = await paymentApi.get(`/api/wallet/${userId}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

export const startWalletTopUp = async (userId, amount, language = "AZ") => {
  try {
    const res = await paymentApi.post("/api/wallet/topup/create", {
      userId,
      amount,
      language,
    });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

export const verifyWalletTopUp = async (ref) => {
  try {
    const res = await paymentApi.get(`/api/wallet/topup/verify/${ref}`);
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

export const payWithWallet = async (orderId) => {
  try {
    const res = await paymentApi.post("/api/wallet/pay", { orderId });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};
