import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Restore user on app start (page refresh / direct URL)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access_token");

    if (storedUser && access) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem("access_token", data.tokens.access);
    localStorage.setItem("refresh_token", data.tokens.refresh);
    localStorage.setItem("user", JSON.stringify(data.user)); // ✅ persist user

    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
