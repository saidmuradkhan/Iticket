import { PayriffError } from "../../backend/payriff.js";

export const MAX_AMOUNT = 500;

export const appOrigin = (req) => {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers.host}`;
};

export const readBody = (req) => {
  if (!req.body) return {};
  return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
};

export const handle = (allowedMethod, run) => async (req, res) => {
  if (req.method !== allowedMethod) {
    res.setHeader("Allow", allowedMethod);
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    res.status(200).json(await run(req));
  } catch (err) {
    if (err instanceof PayriffError) return res.status(502).json({ error: err.message });
    res.status(err.status || 500).json({ error: err.status ? err.message : "Server xətası" });
  }
};

export const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
