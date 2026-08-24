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
            <span className="store-badge">
              <i className="fab fa-google-play" />
              <span className="store-badge-text">
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </span>
            </span>
            <span className="store-badge">
              <i className="fab fa-apple" />
              <span className="store-badge-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </span>
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default MainLayout;
