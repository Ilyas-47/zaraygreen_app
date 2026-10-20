import { create } from 'zustand';
import { usersApi, User } from '../api/users.api';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersApi.getAll();
      const data = (response.data as any).data || response.data;
      if (Array.isArray(data)) {
        set({ users: data, isLoading: false });
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error: any) {
      console.log('Error fetching users:', error?.message);
      set({ error: error.message || 'Failed to fetch users', isLoading: false });
    }
  },

  deleteUser: async (id: string) => {
    try {
      await usersApi.delete(id);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete user' });
      throw error;
    }
  },
}));
