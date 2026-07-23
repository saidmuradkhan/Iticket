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
      <Footer />
    </>
  );
};

export default MainLayout;
