import { createContext, useState, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { login as loginRequest } from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [error, setError] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [authRedirect, setAuthRedirect] = useState(null);

  const openAuth = useCallback((mode = "login", redirect = null) => {
    setError(null);
    setAuthRedirect(redirect);
    setAuthModal(mode === "register" ? "register" : "login");
  }, []);

  const closeAuth = useCallback(() => {
    setError(null);
    setAuthModal(null);
  }, []);

  const login = async (email) => {
    setError(null);
    const res = await loginRequest(email);
    if (res.data.length > 0) {
      setUser(res.data[0]);
      return true;
    }
    setError("Belə istifadəçi tapılmadı");
    return false;
  };

  const register = ({ name, surname, phone, email }) => {
    const fullName = [name, surname].filter(Boolean).join(" ").trim();
    const newUser = {
      id: Date.now(),
      name: fullName || name,
      email,
      phone,
      avatar: "https://i.pravatar.cc/150?img=1",
    };
    setUser(newUser);
    return true;
  };

  const socialLogin = ({ name, email, avatar, provider }) => {
    setError(null);
    setUser({
      id: Date.now(),
      name: name || email || `${provider} istifadəçisi`,
      email: email || "",
      phone: "",
      avatar: avatar || "https://i.pravatar.cc/150?img=1",
      provider,
    });
    return true;
  };

  const updateUser = (fields) => {
    setUser((prev) => ({ ...prev, ...fields }));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        socialLogin,
        updateUser,
        logout,
        error,
        isAuthenticated: !!user,
        authModal,
        authRedirect,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
