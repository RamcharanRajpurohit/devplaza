import { create } from 'zustand';

interface AuthState {
  email: string;
  tempToken: string;
  isVerifying: boolean;
  setEmail: (email: string) => void;
  setTempToken: (token: string) => void;
  setIsVerifying: (status: boolean) => void;
  reset: () => void;
}


export const useAuthStore = create<AuthState>((set) => ({
  email: '',
  tempToken: '',
  isVerifying: false,
  setEmail: (email) => {
    console.log('🔄 Setting email in auth store:', email);
    set({ email });
  },
  setTempToken: (token) => {
    console.log('🔄 Setting temp token in auth store:', token);
    set({ tempToken: token });
  },
  setIsVerifying: (status) => {
    console.log('🔄 Setting verification status:', status);
    set({ isVerifying: status });
  },
  reset: () => {
    console.log('🔄 Resetting auth store');
    set({ email: '', tempToken: '', isVerifying: false });
  }
}));
