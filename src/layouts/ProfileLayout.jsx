import { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PROFILE_NAV, PROFILE_NAV_FOOTER } from "../Profile/profileNav";
import { ProfileNavIcon } from "../Profile/ProfileIcons";

const ProfileLayout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>

        <nav className="profile-sidebar-nav">
          {PROFILE_NAV.map((item) => (
            <NavLink key={item.path} to={item.path}>
              <ProfileNavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}

          <span className="profile-sidebar-divider" />

          {PROFILE_NAV_FOOTER.map((item) => (
            <NavLink key={item.path} to={item.path}>
              <ProfileNavIcon name={item.icon} />
              {item.label}
            </NavLink>
          ))}

          <button type="button" className="profile-sidebar-logout" onClick={logout}>
            <ProfileNavIcon name="logout" />
            Çıxış
          </button>
        </nav>
      </aside>

      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
