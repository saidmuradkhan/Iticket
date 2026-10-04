import { refund } from "../../backend/payriff.js";
import { MAX_AMOUNT, badRequest, handle, readBody } from "./_shared.js";

export default handle("POST", async (req) => {
  const { payriffOrderId, amount } = readBody(req);
  const value = Number(amount);
  if (!payriffOrderId) throw badRequest("payriffOrderId tələb olunur");
  if (!Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT) throw badRequest("Məbləğ düzgün deyil");
  await refund({ payriffOrderId, amount: value });
  return { ok: true };
});
