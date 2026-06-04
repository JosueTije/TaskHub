import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authFetch } from '../../services/api';

export type UserRole = 'ADMIN' | 'PM' | 'DEVELOPER';

type LoginResult =
  | { success: false; error: string }
  | { success: true; requiresOtp: true; otpToken: string }
  | { success: true; requiresOtp: false };

type VerifyOtpResult =
  | { success: false; error: string }
  | { success: true; setupPasswordToken: string };

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
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (code: string) => Promise<VerifyOtpResult>;
  resendOTP: () => Promise<{ success: boolean; error?: string }>;
  pendingEmail: string | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('taskhub_user');
      const savedTheme = localStorage.getItem('taskhub_theme') as 'dark' | 'light' | null;
      const savedPendingEmail = localStorage.getItem('taskhub_pending_email');

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('taskhub_user');
        }
      }

      if (savedPendingEmail) {
        setPendingEmail(savedPendingEmail);
      }

      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      localStorage.removeItem('taskhub_user');
      localStorage.removeItem('taskhub_theme');
      localStorage.removeItem('taskhub_pending_email');
      localStorage.removeItem('taskhub_otp_token');
      localStorage.removeItem('setupPasswordToken');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskhub_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Error al iniciar sesión' };
      }

      if (data.requiresOtp) {
        localStorage.setItem('taskhub_otp_token', data.otpToken);
        localStorage.setItem('taskhub_pending_email', email);
        setPendingEmail(email);

        return {
          success: true,
          requiresOtp: true,
          otpToken: data.otpToken,
        };
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.fullName,
        role: data.user.role,
        avatar: '👤',
        needsPasswordReset: false,
        isActive: true,
      };

      setUser(userData);
      setPendingEmail(null);

      localStorage.setItem('taskhub_user', JSON.stringify(userData));
      localStorage.removeItem('taskhub_pending_email');
      localStorage.removeItem('taskhub_otp_token');
      localStorage.removeItem('setupPasswordToken');

      return { success: true, requiresOtp: false };
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const verifyOTP = async (otp: string): Promise<VerifyOtpResult> => {
    try {
      const otpToken = localStorage.getItem('taskhub_otp_token');

      if (!otpToken) {
        return { success: false, error: 'Sesión OTP no encontrada' };
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otpToken,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || 'Error al validar OTP',
        };
      }

      localStorage.setItem('setupPasswordToken', data.setupPasswordToken);

      return {
        success: true,
        setupPasswordToken: data.setupPasswordToken,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión',
      };
    }
  };

  const resendOTP = async (): Promise<{ success: boolean; error?: string }> => {
    const otpToken = localStorage.getItem('taskhub_otp_token');
    if (!otpToken) {
      return { success: false, error: 'No hay sesión OTP activa. Inicia sesión de nuevo.' };
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'No se pudo reenviar el código' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al cerrar sesión en backend:', error);
    } finally {
      setUser(null);
      setPendingEmail(null);

      localStorage.removeItem('taskhub_user');
      localStorage.removeItem('taskhub_token');
      localStorage.removeItem('taskhub_pending_email');
      localStorage.removeItem('taskhub_otp_token');
      localStorage.removeItem('setupPasswordToken');
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.message || 'Error al enviar el enlace' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' };
    }
  };

  const changePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const setupPasswordToken = localStorage.getItem('setupPasswordToken');

      if (!setupPasswordToken) {
        return {
          success: false,
          error: 'Token de configuración no encontrado',
        };
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/set-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setupPasswordToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.message || 'Error al cambiar contraseña',
        };
      }

      localStorage.removeItem('taskhub_otp_token');
      localStorage.removeItem('setupPasswordToken');
      localStorage.removeItem('taskhub_pending_email');
      setPendingEmail(null);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión',
      };
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const LIMIT = 15;

  const fetchUsers = useCallback(async (p = 1, q = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(LIMIT),
        ...(q.trim() ? { search: q.trim() } : {}),
      });
      const data = await authFetch<{ users: any[]; total: number; page: number; totalPages: number }>(`/users?${params}`);
      setUsers(
        data.users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.fullName,
          role: u.role as UserRole,
          avatar: u.avatarUrl ?? '👤',
          needsPasswordReset: u.status === 'PENDING_SETUP',
          isActive: u.status === 'ACTIVE',
        }))
      );
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err: any) {
      console.error('[useUsers] Error al cargar usuarios:', err);
      setError(err?.message ?? 'No se pudieron cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, search);
  }, [fetchUsers]);

  const goToPage = useCallback((p: number) => {
    fetchUsers(p, search);
  }, [fetchUsers, search]);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    fetchUsers(1, q);
  }, [fetchUsers]);

  const createUser = (userData: User) => {
    setUsers((prev) => [...prev, userData]);
  };

  const updateUser = async (id: string, updates: { name?: string; role?: UserRole }) => {
    const data = await authFetch<{ user: any }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fullName: updates.name, role: updates.role }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, name: data.user.fullName, role: data.user.role as UserRole }
          : u
      )
    );
  };

  const deleteUser = async (id: string) => {
    await authFetch(`/users/${id}`, { method: 'DELETE' });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleUserStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const data = await authFetch<{ user: any }>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isActive: data.user.status === 'ACTIVE' } : u
      )
    );
  };

  const resetUserPassword = async (id: string): Promise<string> => {
    const data = await authFetch<{ temporaryPassword: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
    });
    return data.temporaryPassword;
  };

  return {
    users,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    goToPage,
    handleSearch,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    resetUserPassword,
    refetch: () => fetchUsers(page, search),
  };
};