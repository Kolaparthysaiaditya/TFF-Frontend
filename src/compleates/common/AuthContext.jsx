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
    // If your backend returns: { access: "...", refresh: "...", user: {...} }
    const access = data.access || data.tokens?.access;
    const refresh = data.refresh || data.tokens?.refresh;

    if (!access || !refresh) {
      console.error("No access/refresh token found!");
      return;
    }

    // Save tokens in localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Save user info
    localStorage.setItem("user", JSON.stringify(data.user));

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
