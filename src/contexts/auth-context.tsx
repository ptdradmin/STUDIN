"use client";

import type { ReactNode } from "react";
import { createContext, useState, useContext, useEffect } from "react";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  university?: string;
  field_of_study?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: Omit<User, "id">) => void;
  register: (userData: Omit<User, "id">) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dans une vraie application, vous vérifieriez un jeton avec votre backend
    // Pour cet exemple, nous allons simplement conserver l'état de l'utilisateur en mémoire
    setLoading(false);
  }, []);

  const login = (userData: Omit<User, "id">) => {
    const loggedInUser = { ...userData, id: 1 };
    setUser(loggedInUser);
  };

  const register = (userData: Omit<User, "id">) => {
    const registeredUser = { ...userData, id: Date.now() };
    setUser(registeredUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
};
