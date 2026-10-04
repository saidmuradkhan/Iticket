import { useEffect, useState } from "react";
import { isDemo } from "../../api/api";
import { payriffAvailable } from "../../api/demo/payriffGateway";

const style = {
  position: "fixed",
  left: 16,
  bottom: 16,
  zIndex: 9999,
  maxWidth: "calc(100vw - 32px)",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(20, 20, 20, 0.88)",
  color: "#fff",
  fontSize: 12,
  lineHeight: 1.4,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
  pointerEvents: "none",
};

const DemoBadge = () => {
  const [payriff, setPayriff] = useState(false);

  useEffect(() => {
    if (isDemo) payriffAvailable().then(setPayriff);
  }, []);

  if (!isDemo) return null;

  return (
    <div style={style} role="note">
      Portfolio demo · rəsmi iTicket saytı deyil ·{" "}
      {payriff ? "Payriff test rejimi, real pul çıxılmır" : "ödənişlər simulyasiyadır"}
    </div>
  );
};

export default DemoBadge;
