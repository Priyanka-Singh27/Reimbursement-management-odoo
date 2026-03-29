import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Employee' | 'Manager' | 'Admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
}

interface Company {
  id: string;
  name: string;
  country: string;
  defaultCurrency: string;
}

interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, company: Company, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,
      login: (user, company, token) => set({ user, company, token, isAuthenticated: true }),
      logout: () => set({ user: null, company: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);
