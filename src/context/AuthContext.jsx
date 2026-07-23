import { createContext, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { login as loginRequest } from "../api/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [error, setError] = useState(null);

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

  const register = (name, email, phone) => {
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      avatar: "https://i.pravatar.cc/150?img=1",
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, error, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
