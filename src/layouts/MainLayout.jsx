import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import CategoryNav from "../components/Header/CategoryNav";
import Footer from "../components/Footer/Footer";

const MainLayout = () => {
  return (
    <>
      <Header />
      <CategoryNav />
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
              Növbəti <span className="highlight">vizual səyahətinizi</span> tapın.
            </p>
            <p className="app-promo-sub">
              iTicket.AZ tətbiqi bütün növ tədbirlərə (teatr, idman, konsertlər,
              sərgilər və s.) biletləri əldə etməyi asan və sürətli edir.
            </p>
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
                alt="Get it on Google Play"
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
                alt="Download on the App Store"
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
