import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, type, duration }],
    }));
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'success', dur),
  error: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'error', dur),
  warning: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'warning', dur),
  info: (msg: string, dur?: number) => useToastStore.getState().addToast(msg, 'info', dur),
};
