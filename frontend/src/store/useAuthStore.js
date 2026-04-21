import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const config = { headers: { 'Content-type': 'application/json' } };
      const { data } = await axios.post('/api/user/login', { email, password }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
        isLoading: false 
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const config = { headers: { 'Content-type': 'application/json' } };
      const { data } = await axios.post('/api/user', { name, email, password }, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      set({ user: data, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response && error.response.data.message ? error.response.data.message : error.message,
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    set({ user: null });
  }
}));
