import { NavLink, Outlet } from "react-router-dom";

const ProfileLayout = () => {
  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <NavLink to="/profile/tickets">Biletlər</NavLink>
        <NavLink to="/profile/orders">Sifarişlər</NavLink>
        <NavLink to="/profile/favorites">Sevimlilər</NavLink>
        <NavLink to="/profile/account">Hesab məlumatları</NavLink>
      </aside>
      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
