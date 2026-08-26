
const BASE_URL = process.env.PAYRIFF_BASE_URL || "https://api.payriff.com/api/v3/";
const SECRET_KEY = process.env.PAYRIFF_SECRET_KEY;

export const SUCCESS_CODE = "00000";
export const STATUS_APPROVED = "APPROVED";

export class PayriffError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "PayriffError";
    this.details = details;
  }
}

export const hasCredentials = () => Boolean(SECRET_KEY);

const TIMEOUT_MS = 20000;

const GET_RETRIES = 2;

const send = (uri, method, body) =>
  fetch(BASE_URL + uri, {
    method,
    headers: {
      
      Authorization: SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

const request = async (uri, { method = "GET", body } = {}) => {
  if (!SECRET_KEY) {
    throw new PayriffError(
      "PAYRIFF_SECRET_KEY tapılmadı. .env faylına secret key əlavə edin."
    );
  }

  const attempts = method === "GET" ? GET_RETRIES + 1 : 1;
  let res;

  for (let attempt = 1; ; attempt++) {
    try {
      res = await send(uri, method, body);
      break;
    } catch (err) {
      if (attempt < attempts) {
        console.warn(`[payriff] ${uri} cəhd ${attempt} alınmadı (${err.name}), təkrar edilir`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw new PayriffError(`Payriff-ə qoşulmaq mümkün olmadı: ${err.message}`);
    }
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new PayriffError(`Payriff gözlənilməz cavab qaytardı (HTTP ${res.status})`, text);
  }

  if (!res.ok || data.code !== SUCCESS_CODE) {
    throw new PayriffError(
      data.message || data.internalMessage || `Payriff xətası (HTTP ${res.status})`,
      data
    );
  }

  return data.payload ?? {};
};

export const createOrder = ({
  amount,
  callbackUrl,
  description,
  currency = "AZN",
  language = "AZ",
  cardSave = false,
  operation = "PURCHASE",
}) =>
  request("orders", {
    method: "POST",
    body: {
      
      amount: Number(Number(amount).toFixed(2)),
      currency,
      language,
      description,
      callbackUrl,
      cardSave,
      operation,
    },
  });

export const getOrderInformation = (payriffOrderId) =>
  request(`orders/${encodeURIComponent(payriffOrderId)}`);

export const refund = ({ payriffOrderId, amount }) =>
  request("refund", {
    method: "POST",
    body: {
      orderId: payriffOrderId,
      amount: Number(Number(amount).toFixed(2)),
    },
  });
