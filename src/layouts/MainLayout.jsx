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
        <p>
          Növbəti <span className="highlight">vizual səyahətinizi</span> tapın.
        </p>
        <p className="app-promo-sub">
          iTicket.AZ tətbiqi bütün növ tədbirlərə (teatr, idman, konsertlər,
          sərgilər və s.) biletləri əldə etməyi asan və sürətli edir.
        </p>
        <div className="app-promo-badges">
          <span className="store-badge">
            <i className="fab fa-google-play" /> Google Play
          </span>
          <span className="store-badge">
            <i className="fab fa-apple" /> App Store
          </span>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default MainLayout;
