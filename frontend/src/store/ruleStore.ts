import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConditionField = 'amount' | 'category' | 'department';
export type ConditionOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'IN';

export interface RuleCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number;
}

export interface ApprovalStep {
  id: string;
  role: 'Manager' | 'Finance' | 'Admin' | 'HR';
  action: 'Approve' | 'Notify';
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: RuleCondition[];
  steps: ApprovalStep[];
}

interface RuleState {
  rules: ApprovalRule[];
  addRule: (rule: ApprovalRule) => void;
  updateRule: (id: string, rule: Partial<ApprovalRule>) => void;
  deleteRule: (id: string) => void;
  reorderRules: (startIndex: number, endIndex: number) => void;
}

const defaultRules: ApprovalRule[] = [
  {
    id: 'rule_1',
    name: 'Standard Expense Auto-Approve',
    description: 'Auto-approves small daily expenses like local food and cab fare if under $50.',
    isActive: true,
    priority: 1,
    conditions: [
      { id: 'cond_1', field: 'amount', operator: '<', value: 50 },
      { id: 'cond_2', field: 'category', operator: 'IN', value: 'Food,Travel' }
    ],
    steps: [] // empty steps imply auto-approve
  },
  {
    id: 'rule_2',
    name: 'High Value Travel',
    description: 'Travel expenses over $1,000 require Manager and Admin sign-off.',
    isActive: true,
    priority: 2,
    conditions: [
      { id: 'cond_3', field: 'amount', operator: '>=', value: 1000 },
      { id: 'cond_4', field: 'category', operator: '==', value: 'Travel' }
    ],
    steps: [
      { id: 'step_1', role: 'Manager', action: 'Approve' },
      { id: 'step_2', role: 'Admin', action: 'Approve' }
    ]
  }
];

export const useRuleStore = create<RuleState>()(
  persist(
    (set) => ({
      rules: defaultRules,
      addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
      updateRule: (id, updatedFields) => set((state) => ({
        rules: state.rules.map(r => r.id === id ? { ...r, ...updatedFields } : r)
      })),
      deleteRule: (id) => set((state) => ({
        rules: state.rules.filter(r => r.id !== id)
      })),
      reorderRules: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.rules);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        // update priority fields
        const sorted = result.map((r, i) => ({ ...r, priority: i + 1 }));
        return { rules: sorted };
      })
    }),
    {
      name: 'rule-storage',
    }
  )
);
