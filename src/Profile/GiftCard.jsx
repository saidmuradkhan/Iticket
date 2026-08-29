import { useLanguage } from "../hooks/useLanguage";

const GiftCard = () => {
  const { t } = useLanguage();

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>{t("giftCard.title")}</h1>
      </div>
      <p className="profile-subheading">
        {t("giftCard.subheading")}
      </p>

      <div className="gift-card-form">
        <div className="gift-card">
          <svg className="gift-card-ribbon" viewBox="0 0 120 120" aria-hidden="true">
            <rect x="52" y="48" width="16" height="24" rx="4" fill="#ffffff" />
            <path d="M55 60 C 18 38, 16 72, 55 66 Z" fill="#ffffff" />
            <path d="M65 60 C 102 38, 104 72, 65 66 Z" fill="#ffffff" />
            <path d="M56 70 L 42 100 L 59 90 Z" fill="#ffffff" />
            <path d="M64 70 L 78 100 L 61 90 Z" fill="#ffffff" />
            <circle cx="60" cy="60" r="5" fill="#facc15" />
          </svg>

          <div className="gift-card-brand">
            <span>
              igift<em>.az</em>
            </span>
            <small>{t("giftCard.cardLabel")}</small>
          </div>

          <div className="gift-card-fields">
            <span className="gift-card-number">1234 5678 9000 0000</span>
            <div className="gift-card-exp">
              <span>08</span>
              <span className="gift-card-exp-sep">/</span>
              <span>2026</span>
            </div>
          </div>
        </div>

        <p className="gift-card-note">
          {t("giftCard.note")}
        </p>

        <button type="button" className="primary-btn gift-card-submit">
          {t("giftCard.submit")}
        </button>
      </div>
    </div>
  );
};

export default GiftCard;
