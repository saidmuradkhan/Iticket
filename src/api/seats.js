import { paymentApi } from "./payriff";

// backend-dən gələn xəta mətnini çıxarır
const extractError = (err) =>
  err.response?.data?.error || "Yer serverinə qoşulmaq mümkün olmadı";

/** Tədbir üçün tutulmuş yerləri qaytarır: { eventId, taken: [{ seatKey, status, mine, expiresAt }] } */
export const getSeatStatus = async (eventId, userId) => {
  try {
    const res = await paymentApi.get(`/api/seats/${eventId}`, {
      params: userId != null ? { userId } : undefined,
    });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};

/** Bir yeri tutur. Başqası artıq tutubsa xəta atır (409). */
export const holdSeat = async (eventId, seatKey, userId) => {
  try {
    const res = await paymentApi.post("/api/seats/hold", { eventId, seatKey, userId });
    return res.data;
  } catch (err) {
    const error = new Error(extractError(err), { cause: err });
    error.status = err.response?.status;
    throw error;
  }
};

/** İstifadəçinin tutduğu yeri buraxır. */
export const releaseSeat = async (eventId, seatKey, userId) => {
  try {
    const res = await paymentApi.post("/api/seats/release", { eventId, seatKey, userId });
    return res.data;
  } catch (err) {
    throw new Error(extractError(err), { cause: err });
  }
};
