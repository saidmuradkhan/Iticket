import { getOrderInformation } from "../../backend/payriff.js";
import { badRequest, handle } from "./_shared.js";

export default handle("GET", async (req) => {
  const id = req.query.id;
  if (!id) throw badRequest("id tələb olunur");
  const info = await getOrderInformation(id);
  return { paymentStatus: info.paymentStatus, amount: info.amount, currency: info.currencyType };
});
