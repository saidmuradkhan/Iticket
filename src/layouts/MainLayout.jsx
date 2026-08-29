import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import CategoryNav from "../components/Header/CategoryNav";
import Footer from "../components/Footer/Footer";
import AuthModal from "../components/Auth/AuthModal";
import { useLanguage } from "../hooks/useLanguage";

const MainLayout = () => {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <CategoryNav />
      <AuthModal />
      <main>
        <Outlet />
      </main>

      <section className="app-promo">
        <div className="app-promo-card">
          <div className="app-promo-dots" aria-hidden="true">
            <span className="promo-dot" />
            <span className="promo-dot" />
            <span className="promo-dot" />
            <span className="promo-dot" />
            <span className="promo-dot" />
          </div>
          <div className="app-promo-text">
            <p className="app-promo-title">
              {t("layout.promoTitlePrefix")} <span className="highlight">{t("layout.promoTitleHighlight")}</span> {t("layout.promoTitleSuffix")}
            </p>
            <p className="app-promo-sub">{t("layout.promoSubtitle")}</p>
          </div>
          <div className="app-promo-badges">
            <a
              className="store-link"
              href="https://play.google.com/store/apps/details?id=az.iticket.iticket"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Play"
            >
              <img
                className="store-img"
                src="/google-play.png"
                alt={t("layout.googlePlayAlt")}
                loading="lazy"
                decoding="async"
                width="270"
                height="80"
              />
            </a>
            <a
              className="store-link"
              href="https://apps.apple.com/az/app/iticket-az/id1456260325"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="App Store"
            >
              <img
                className="store-img"
                src="/app-store.png"
                alt={t("layout.appStoreAlt")}
                loading="lazy"
                decoding="async"
                width="168"
                height="57"
              />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default MainLayout;
