import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Role = "administrador" | "responsable" | "supervisor" | "auditor" | null;

interface User {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = (email: string, password: string) => {
    let role: Role = null;

    if (email === "admin@gmail.com" && password === "123") role = "administrador";
    else if (email === "responsable@gmail.com" && password === "123") role = "responsable";
    else if (email === "supervisor@gmail.com" && password === "123") role = "supervisor";
    else if (email === "auditor@gmail.com" && password === "123") role = "auditor";

    if (role) {
      setUser({ email, role });
      navigate("/"); // ✅ solo redirige al home
    } else {
      alert("Correo no autorizado");
    }
  };

  const logout = () => {
    setUser(null);
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
