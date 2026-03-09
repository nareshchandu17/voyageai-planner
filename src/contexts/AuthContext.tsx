import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("voyageai_user");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: User = { id: crypto.randomUUID(), name: email.split("@")[0], email };
    localStorage.setItem("voyageai_user", JSON.stringify(u));
    setUser(u);
  };

  const signUp = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: User = { id: crypto.randomUUID(), name, email };
    localStorage.setItem("voyageai_user", JSON.stringify(u));
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem("voyageai_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
