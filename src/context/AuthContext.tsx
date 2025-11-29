import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Tipos de roles del sistema
type Role = "administrador" | "supervisor" | "responsable" | "auditor" | null;

interface User {
  id: number;
  email: string;
  nombre: string;
  role: Role;
  rolOriginal: string; // El nombre del rol tal como viene del backend
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para mapear el rol del backend a los roles del frontend
const mapearRol = (rolBackend: string): Role => {
  const rol = rolBackend.toUpperCase();
  
  if (rol.includes("ADMIN")) return "administrador";
  if (rol.includes("SUPERVISOR")) return "supervisor";
  if (rol.includes("RESPONSABLE") || rol.includes("ELABOR")) return "responsable";
  if (rol.includes("AUDITOR") || rol.includes("CONSULTA")) return "auditor";
  
  // Por defecto, responsable (rol más restrictivo)
  return "responsable";
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        correo: email,
        contrasena: password,
      });

      const { token, rol, nombre, usuarioId } = response.data;

      // Guardar token
      localStorage.setItem("token", token);

      // Crear objeto de usuario
      const userData: User = {
        id: usuarioId,
        email: email,
        nombre: nombre,
        role: mapearRol(rol),
        rolOriginal: rol,
      };

      // Guardar usuario
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Redirigir al dashboard
      navigate("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const mensaje = err.response?.data?.message || "Credenciales inválidas";
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signin");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Hook para verificar permisos
export const useHasPermission = (allowedRoles: Role[]) => {
  const { user } = useAuth();
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

// Hook para obtener el rol actual
export const useRole = (): Role => {
  const { user } = useAuth();
  return user?.role || null;
};