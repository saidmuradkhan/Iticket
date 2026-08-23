import { useState } from "react";
import { ChevronIcon } from "./ProfileIcons";

const TABS = [
  { key: "incoming", label: "Gələnlər" },
  { key: "outgoing", label: "Göndərilənlər" },
];

const EMPTY_TEXT = {
  incoming:
    "Hazırda təsdiqinizə ehtiyac duyan transfer yoxdur. Sizə göndərilən yeni transferlər olduqda bildiriş alacaqsınız.",
  outgoing:
    "Hazırda göndərdiyiniz aktiv transfer yoxdur. Bilet göndərdikdən sonra transferin statusunu burada izləyə bilərsiniz.",
};

const Transfers = () => {
  const [tab, setTab] = useState("incoming");
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>Transferlər</h1>
      </div>

      <div className="profile-tabs">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.key}
            className={tab === item.key ? "active" : undefined}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="profile-empty profile-empty-narrow">{EMPTY_TEXT[tab]}</p>

      <div className="profile-accordion">
        <button
          type="button"
          className="profile-accordion-head"
          onClick={() => setHistoryOpen((prev) => !prev)}
          aria-expanded={historyOpen}
        >
          Keçmiş transferlər
          <span className={historyOpen ? "rotated" : undefined}>
            <ChevronIcon />
          </span>
        </button>
        {historyOpen && (
          <p className="profile-accordion-body">
            Keçmiş transfer tarixçəniz boşdur.
          </p>
        )}
      </div>
    </div>
  );
};

export default Transfers;
