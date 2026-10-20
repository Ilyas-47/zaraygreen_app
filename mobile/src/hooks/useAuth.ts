// src/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';
import { authApi }      from '../api/auth.api';
import { LoginDto, RegisterDto } from '../types/user.types';

export const useAuth = () => {
  const { user, login, logout, isLoading, setLoading } = useAuthStore();

  const handleLogin = async (data: LoginDto) => {
    try {
      setLoading(true);
      const res = await authApi.login(data);
      login(res.data.user);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterDto) => {
    try {
      setLoading(true);
      const res = await authApi.register(data);
      login(res.data.user);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin:         user?.role === 'ADMIN',
    isLivreur:       user?.role === 'LIVREUR',
    isTechnicien:    user?.role === 'TECHNICIEN',
    handleLogin,
    handleRegister,
    handleLogout,
  };
};