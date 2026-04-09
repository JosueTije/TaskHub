import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'PM' | 'DEVELOPER';

type LoginResult =
  | { success: false; error: string }
  | { success: true; requiresOtp: true; otpToken: string }
  | { success: true; requiresOtp: false };

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  needsPasswordReset: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (
  email: string,
  password: string
) => Promise<{
  success: boolean;
  requiresOtp?: boolean;
  otpToken?: string;
  error?: string;
}>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (code: string) => Promise<{ success: boolean; needsPasswordReset?: boolean; error?: string }>;
  resendOTP: () => Promise<{ success: boolean; error?: string }>;
  pendingEmail: string | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@taskhub.com',
    password: 'Admin123!',
    name: 'Admin TaskHub',
    role: 'ADMIN',
    avatar: '👨‍💼',
    needsPasswordReset: false,
    isActive: true,
  },
  {
    id: '2',
    email: 'pm@taskhub.com',
    password: 'PM123!',
    name: 'Project Manager',
    role: 'PM',
    avatar: '👔',
    needsPasswordReset: false,
    isActive: true,
  },
  {
    id: '3',
    email: 'dev@taskhub.com',
    password: 'Dev123!',
    name: 'Sofia Torres',
    role: 'DEVELOPER',
    avatar: '👩‍💻',
    needsPasswordReset: false,
    isActive: true,
  },

  {
    id: '4',
    email: 'carlos@taskhub.com',
    password: 'Default123!',
    name: 'Carlos Mendoza',
    role: 'DEVELOPER',
    avatar: '👨‍💻',
    needsPasswordReset: true, 
    isActive: true,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [users, setUsers] = useState(DEMO_USERS);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingUserData, setPendingUserData] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('taskhub_user');
      const savedTheme = localStorage.getItem('taskhub_theme') as 'dark' | 'light' | null;
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        } else {

          localStorage.removeItem('taskhub_user');
        }
      }
      
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {

      localStorage.removeItem('taskhub_user');
      localStorage.removeItem('taskhub_theme');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskhub_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

const login = async (email: string, password: string) => {
  try {
    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message };
    }

if (data.requiresOtp) {
localStorage.setItem("taskhub_otp_token", data.otpToken);
localStorage.setItem("taskhub_pending_email", email);

  return {
    success: true,
    requiresOtp: true,
    otpToken: data.otpToken,
  };
}

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.fullName,
      role: data.user.role,
      avatar: "👤",
      needsPasswordReset: false,
      isActive: true,
    };

    setUser(userData);
    localStorage.setItem("taskhub_user", JSON.stringify(userData));

    return { success: true };

  } catch (err) {
    return { success: false, error: "Error de conexión" };
  }
};

const verifyOTP = async (otp: string) => {
  try {
    const otpToken = localStorage.getItem("taskhub_otp_token");
    console.log("OTP TOKEN USADO:", otpToken);
    console.log("OTP INGRESADO:", otp);

    const res = await fetch("http://localhost:4000/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otpToken,
        otp,
      }),
    });

    const data = await res.json();
    console.log("VERIFY OTP RESPONSE:", data);

    if (!res.ok) {
      return { success: false, error: data.message || "Error al validar OTP" };
    }

    localStorage.setItem("taskhub_setup_password_token", data.setupPasswordToken);

    return { success: true };
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return { success: false, error: "Error de conexión" };
  }
};

  const resendOTP = async (): Promise<{ success: boolean; error?: string }> => {

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!pendingEmail) {
      return { success: false, error: 'No hay solicitud de OTP pendiente' };
    }

    return { success: true };
  };

const logout = async () => {
  try {
    await fetch("http://localhost:4000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error al cerrar sesión en backend:", error);
  } finally {
    setUser(null);
    localStorage.removeItem("taskhub_user");
    localStorage.removeItem("taskhub_token");
  }
};

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {

    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      return { success: false, error: 'No existe una cuenta con ese correo' };
    }

    return { success: true };
  };

const changePassword = async (newPassword: string) => {
  try {
    const setupPasswordToken = localStorage.getItem("taskhub_setup_password_token");

    console.log("SETUP TOKEN:", setupPasswordToken);
    console.log("NEW PASSWORD:", newPassword);

    const res = await fetch("http://localhost:4000/auth/set-new-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        setupPasswordToken,
        newPassword,
      }),
    });

    const data = await res.json();
    console.log("SET PASSWORD RESPONSE:", data);

    if (!res.ok) {
      return { success: false, error: data.message };
    }

    localStorage.removeItem("taskhub_otp_token");
    localStorage.removeItem("taskhub_pending_email");
    localStorage.removeItem("taskhub_setup_password_token");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error de conexión" };
  }
};

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        resetPassword,
        changePassword,
        verifyOTP,
        resendOTP,
        pendingEmail,
        isAuthenticated: !!user,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUsers = () => {
  const [users, setUsers] = useState(DEMO_USERS);

  const createUser = (userData: Omit<User & { password: string }, 'id'>) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      needsPasswordReset: true,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const resetUserPassword = (id: string) => {
    const newPassword = 'Default123!';
    setUsers(prev => prev.map(u => 
      u.id === id 
        ? { ...u, password: newPassword, needsPasswordReset: true }
        : u
    ));
    return newPassword;
  };
  const verifyOTP = async (otp: string) => {
  try {
    const otpToken = localStorage.getItem("taskhub_otp_token");

    if (!otpToken) {
      return { success: false, error: "Sesión OTP no encontrada" };
    }

    const res = await fetch("http://localhost:4000/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otpToken,
        otp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message };
    }

    localStorage.setItem("taskhub_setup_password_token", data.setupPasswordToken);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error de conexión" };
  }
};

  return {
    users: users.map(({ password, ...user }) => user),
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
  };
};