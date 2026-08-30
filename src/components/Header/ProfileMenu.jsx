import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useLanguage } from "../../hooks/useLanguage";
import { PROFILE_NAV, PROFILE_NAV_FOOTER } from "../../Profile/profileNav";
import { ProfileNavIcon } from "../../Profile/ProfileIcons";
import { UserIcon } from "./HeaderIcons";

const ProfileMenu = () => {
  const { isAuthenticated, logout, openAuth } = useContext(AuthContext);
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!isAuthenticated) {
    return (
      <button type="button" className="header-btn header-link" onClick={() => openAuth("login")}>
        <span className="header-btn-icon-slot"><UserIcon /></span>
        {t("header.login")}
      </button>
    );
  }

  const renderItem = (item) => (
    <Link key={item.path} to={item.path} role="menuitem" className={pathname === item.path ? "active" : undefined} onClick={() => setOpen(false)}>
      <ProfileNavIcon name={item.icon} />
      {t(item.label)}
    </Link>
  );

  return (
    <div className="profile-menu-wrapper" ref={wrapperRef}>
      <button type="button" className="header-btn header-link" onClick={() => setOpen((prev) => !prev)} aria-expanded={open} aria-haspopup="menu">
        <span className="header-btn-icon-slot"><UserIcon /></span>
        {t("header.profile")}
      </button>

      {open && (
        <div className="profile-menu" role="menu">
          {PROFILE_NAV.map(renderItem)}

          <span className="profile-menu-divider" />

          {PROFILE_NAV_FOOTER.map(renderItem)}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <ProfileNavIcon name="logout" />
            {t("header.logout")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
