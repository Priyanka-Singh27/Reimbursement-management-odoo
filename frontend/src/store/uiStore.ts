import { create } from 'zustand';
import { Expense } from './expenseStore';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface UiState {
  activeExpenseDetail: Expense | null;
  setActiveExpenseDetail: (expense: Expense | null) => void;
  
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  isRightPanelOpen: boolean;
}

export const useUiStore = create<UiState>((set) => ({
  activeExpenseDetail: null,
  setActiveExpenseDetail: (expense) => set({ activeExpenseDetail: expense, isRightPanelOpen: !!expense }),
  
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000); // 3 second auto-dismiss
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  
  isRightPanelOpen: false,
}));
