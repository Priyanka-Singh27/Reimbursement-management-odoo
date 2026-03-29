import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInDays, parseISO } from 'date-fns';

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ExpenseEvent {
  id: string;
  approverId: string;
  approverName: string;
  action: 'Approved' | 'Rejected' | 'Commented';
  comment?: string;
  timestamp: string;
}

export interface FraudSignal {
  type: 'EXACT_DUPE' | 'FUZZY_DUPE' | 'MERCHANT_DUPE' | 'ROUND_NUMBER' | 'VELOCITY';
  reason: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  companyCurrency: string;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string; // Base64 simulated for demo
  status: ExpenseStatus;
  timeline: ExpenseEvent[];
  fraudScore?: number;
  fraudSignals?: FraudSignal[];
}

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpenseStatus: (id: string, status: ExpenseStatus, event: ExpenseEvent) => void;
  evaluateFraud: (expense: Partial<Expense>, userId: string) => { score: number, signals: FraudSignal[] };
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
      updateExpenseStatus: (id, status, event) => set((state) => ({
        expenses: state.expenses.map(e => 
          e.id === id 
            ? { ...e, status, timeline: [...e.timeline, event] } 
            : e
        )
      })),
      evaluateFraud: (expense: Partial<Expense>, userId: string) => {
        const history = get().expenses;
        let score = 0;
        const signals: FraudSignal[] = [];

        // Evaluate Round Number Anomaly (e.g. exactly 5000.00 with no decimals, usually cash)
        if (expense.amount && expense.amount >= 100 && expense.amount % 100 === 0) {
          score += 15;
          signals.push({ type: 'ROUND_NUMBER', reason: 'Unusually round amount detected, suggesting an anomalous or estimated cash claim.' });
        }

        const userHistory = history.filter(e => e.userId === userId);
        const thisDate = expense.date ? parseISO(expense.date) : new Date();

        for (const past of userHistory) {
          const pastDate = parseISO(past.date);
          const daysDiff = Math.abs(differenceInDays(thisDate, pastDate));

          // 1. Exact Duplicate
          if (past.amount === expense.amount && past.date === expense.date) {
            score += 100;
            signals.push({ type: 'EXACT_DUPE', reason: `Exact match found: You submitted ${past.companyCurrency} ${past.convertedAmount} on ${past.date}.` });
            break; // Max score reached
          }

          // 2. Fuzzy Duplicate (+- 10% amount, +- 3 days, same category)
          if (expense.amount && past.category === expense.category && daysDiff <= 3) {
            const amountDiffRatio = Math.abs(past.amount - expense.amount) / expense.amount;
            if (amountDiffRatio <= 0.1 && amountDiffRatio > 0) {
              score += 65;
              signals.push({ type: 'FUZZY_DUPE', reason: `A suspiciously similar ${past.category} expense was submitted within 3 days (₹${past.amount}).` });
            }
          }

          // 3. Merchant / Exact Description Duplicate in 7 days
          if (expense.description && past.description.toLowerCase() === expense.description.toLowerCase() && daysDiff <= 7) {
             score += 55;
             signals.push({ type: 'MERCHANT_DUPE', reason: `You recently claimed an identical expense description ("${past.description}").` });
          }
        }

        return { score: Math.min(score, 100), signals };
      }
    }),
    {
      name: 'expense-storage',
    }
  )
);
