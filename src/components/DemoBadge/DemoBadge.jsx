import { isDemo } from "../../api/api";

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

const DemoBadge = () =>
  isDemo ? (
    <div style={style} role="note">
      Portfolio demo · rəsmi iTicket saytı deyil · ödənişlər simulyasiyadır
    </div>
  ) : null;

export default DemoBadge;
