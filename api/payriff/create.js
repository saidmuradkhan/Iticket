import { createOrder } from "../../backend/payriff.js";
import { MAX_AMOUNT, appOrigin, badRequest, handle, readBody } from "./_shared.js";

export default handle("POST", async (req) => {
  const { amount, description, returnPath, language = "AZ" } = readBody(req);
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT) {
    throw badRequest(`Məbləğ 0–${MAX_AMOUNT} ₼ aralığında olmalıdır`);
  }
  if (typeof returnPath !== "string" || !returnPath.startsWith("/payment/result")) {
    throw badRequest("returnPath düzgün deyil");
  }

  const payload = await createOrder({
    amount: value,
    description: String(description || "İticket").slice(0, 120),
    language,
    callbackUrl: appOrigin(req) + returnPath,
  });

  return {
    orderId: payload.orderId,
    transactionId: payload.transactionId,
    paymentUrl: payload.paymentUrl,
  };
});
