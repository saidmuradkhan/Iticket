import { useState } from "react";
import { ChevronIcon } from "./ProfileIcons";
import { useLanguage } from "../hooks/useLanguage";

const TABS = [
  { key: "incoming", label: "transfers.tabIncoming" },
  { key: "outgoing", label: "transfers.tabOutgoing" },
];

const EMPTY_TEXT = {
  incoming: "transfers.emptyIncoming",
  outgoing: "transfers.emptyOutgoing",
};

const Transfers = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState("incoming");
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>{t("transfers.title")}</h1>
      </div>

      <div className="profile-tabs">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.key}
            className={tab === item.key ? "active" : undefined}
            onClick={() => setTab(item.key)}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <p className="profile-empty profile-empty-narrow">{t(EMPTY_TEXT[tab])}</p>

      <div className="profile-accordion">
        <button
          type="button"
          className="profile-accordion-head"
          onClick={() => setHistoryOpen((prev) => !prev)}
          aria-expanded={historyOpen}
        >
          {t("transfers.historyToggle")}
          <span className={historyOpen ? "rotated" : undefined}><ChevronIcon /></span>
        </button>
        {historyOpen && <p className="profile-accordion-body">{t("transfers.historyEmpty")}</p>}
      </div>
    </div>
  );
};

export default Transfers;
