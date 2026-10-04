let availability;

export const payriffAvailable = () => {
  availability ??= fetch("/api/payriff/health")
    .then((res) => (res.ok ? res.json() : { enabled: false }))
    .then((data) => Boolean(data.enabled))
    .catch(() => false);
  return availability;
};

const call = async (path, options = {}) => {
  const res = await fetch(`/api/payriff/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "Ödəniş serverinə qoşulmaq mümkün olmadı");
    error.status = res.status;
    throw error;
  }
  return data;
};

export const createPayriffOrder = (body) =>
  call("create", { method: "POST", body: JSON.stringify(body) });

export const getPayriffStatus = (payriffOrderId) =>
  call(`status?id=${encodeURIComponent(payriffOrderId)}`);

export const refundPayriffOrder = (body) =>
  call("refund", { method: "POST", body: JSON.stringify(body) });

export const mapPaymentStatus = (paymentStatus) => {
  switch (paymentStatus) {
    case "APPROVED":
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
