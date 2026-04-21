import { create } from 'zustand';
import axios from 'axios';

export const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchChats: async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/chat', config);
      set({ chats: data });
    } catch (error) {
      console.error(error);
    }
  },

  setSelectedChat: (chat) => set({ selectedChat: chat }),

  accessChat: async (userId, token) => {
    set({ isLoading: true });
    try {
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('/api/chat', { userId }, config);
      
      const { chats } = get();
      if (!chats.find((c) => c._id === data._id)) set({ chats: [data, ...chats] });
      set({ selectedChat: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  fetchMessages: async (chatId, token) => {
    set({ isLoading: true });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`/api/message/${chatId}`, config);
      set({ messages: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (content, chatId, token) => {
    try {
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('/api/message', { content, chatId }, config);
      set((state) => ({ messages: [...state.messages, data] }));
      return data;
    } catch (error) {
      console.error(error);
    }
  },

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] }))
}));
