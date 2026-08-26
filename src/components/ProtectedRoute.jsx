import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, openAuth } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      openAuth("login", location.pathname);
    }
  }, [isAuthenticated, openAuth, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
