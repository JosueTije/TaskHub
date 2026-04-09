import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'PM' | 'DEVELOPER';

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
  login: (email: string, password: string) => Promise<{ success: boolean; needsPasswordReset?: boolean; needsOTP?: boolean; error?: string }>;
  verifyOTP: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  pendingOTPVerification: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios hardcoded para demo
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
  // Usuarios adicionales creados por el admin
  {
    id: '4',
    email: 'carlos@taskhub.com',
    password: 'Default123!',
    name: 'Carlos Mendoza',
    role: 'DEVELOPER',
    avatar: '👨‍💻',
    needsPasswordReset: true, // Necesita cambiar contraseña
    isActive: true,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [users, setUsers] = useState(DEMO_USERS);
  const [pendingOTPVerification, setPendingOTPVerification] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const savedUser = localStorage.getItem('taskhub_user');
    const savedTheme = localStorage.getItem('taskhub_theme') as 'dark' | 'light' | null;
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Guardar theme en localStorage
  useEffect(() => {
    localStorage.setItem('taskhub_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = async (email: string, password: string): Promise<{ success: boolean; needsPasswordReset?: boolean; needsOTP?: boolean; error?: string }> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, error: 'Credenciales incorrectas' };
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'Usuario desactivado. Contacta al administrador.' };
    }

    const userWithoutPassword = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      avatar: foundUser.avatar,
      needsPasswordReset: foundUser.needsPasswordReset,
      isActive: foundUser.isActive,
    };

    // Guardar usuario temporal (aún no autenticado completamente)
    setTempUser(userWithoutPassword);
    setPendingOTPVerification(true);

    return { 
      success: true,
      needsOTP: true, // Siempre requerir OTP
      needsPasswordReset: foundUser.needsPasswordReset 
    };
  };

  const verifyOTP = async (code: string): Promise<{ success: boolean; error?: string }> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!tempUser) {
      return { success: false, error: 'No hay sesión pendiente' };
    }

    // Verificar código (en demo, cualquier código de 6 dígitos es válido, pero puedes usar 123456)
    if (code.length !== 6) {
      return { success: false, error: 'Código inválido' };
    }

    // Después de verificar OTP exitosamente, autenticar al usuario
    setUser(tempUser);
    localStorage.setItem('taskhub_user', JSON.stringify(tempUser));
    setPendingOTPVerification(false);
    setTempUser(null);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setTempUser(null);
    setPendingOTPVerification(false);
    localStorage.removeItem('taskhub_user');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      return { success: false, error: 'No existe una cuenta con ese correo' };
    }

    // En una app real, aquí se enviaría un email
    return { success: true };
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!user) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    // Actualizar el usuario en la lista
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === user.id 
          ? { ...u, password: newPassword, needsPasswordReset: false }
          : u
      )
    );

    // Actualizar el usuario actual
    const updatedUser = { ...user, needsPasswordReset: false };
    setUser(updatedUser);
    localStorage.setItem('taskhub_user', JSON.stringify(updatedUser));

    return { success: true };
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthContext.Provider
      value={{
        user: pendingOTPVerification ? tempUser : user,
        login,
        verifyOTP,
        logout,
        resetPassword,
        changePassword,
        isAuthenticated: !!user && !pendingOTPVerification,
        pendingOTPVerification,
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

// Hook para usuarios (solo para ADMIN)
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

  return {
    users: users.map(({ password, ...user }) => user), // No exponer passwords
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
  };
};
