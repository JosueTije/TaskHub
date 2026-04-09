import { createContext, useContext, useState, ReactNode } from 'react';
export type UserRole = 'ADMIN' | 'PM' | 'DEVELOPER';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  assignedProjects?: string[];
}
interface UserContextType {
  user: User;
  role: UserRole;
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
}
const UserContext = createContext<UserContextType | undefined>(undefined);
export const mockUsers: Record<UserRole, User> = {
  ADMIN: {
    id: 'admin-1',
    name: 'Carlos Admin',
    email: 'carlos.admin@taskhub.com',
    role: 'ADMIN',
    avatar: 'CA'
  },
  PM: {
    id: 'pm-1',
    name: 'María González',
    email: 'maria.gonzalez@taskhub.com',
    role: 'PM',
    avatar: 'MG',
    assignedProjects: ['1', '2']
  },
  DEVELOPER: {
    id: 'dev-1',
    name: 'Juan Developer',
    email: 'juan.dev@taskhub.com',
    role: 'DEVELOPER',
    avatar: 'JD',
    assignedProjects: ['1']
  }
};
export function UserProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User>(mockUsers.PM);
  const switchRole = (role: UserRole) => {
    setUser(mockUsers[role]);
  };
  return <UserContext.Provider value={{
    user,
    role: user.role,
    setUser,
    switchRole
  }}>
      {children}
    </UserContext.Provider>;
}
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}