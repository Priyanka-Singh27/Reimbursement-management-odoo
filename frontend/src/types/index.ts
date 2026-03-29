// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  companyId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

// Company types
export interface Company {
  _id: string;
  name: string;
  country: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

// Expense types
export interface Expense {
  _id: string;
  userId: string;
  companyId: string;
  amount: number;
  convertedAmount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  currentStep: number;
  receiptImageUrl?: string;
  approvalFlowId: string;
  approvedBy: string[];
  rejectedBy: string[];
  createdAt: string;
  updatedAt: string;
}

// Approval Flow types
export interface ApprovalStep {
  sequence: number;
  role?: 'Admin' | 'Manager' | 'Employee';
  userId?: string;
}

export interface ApprovalRules {
  type: 'percentage' | 'specific' | 'hybrid';
  percentageThreshold?: number;
  specificApproverRoles?: string[];
  specificApproverUsers?: string[];
}

export interface ApprovalFlow {
  _id: string;
  companyId: string;
  name: string;
  steps: ApprovalStep[];
  rules: ApprovalRules;
  createdAt: string;
  updatedAt: string;
}

// Approval Log types
export interface ApprovalLog {
  _id: string;
  expenseId: string;
  approverId: string;
  action: 'Approved' | 'Rejected';
  comment?: string;
  createdAt: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  country: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface ExpenseForm {
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  receipt?: File;
}

// Country types for signup
export interface Country {
  name: string;
  currencies: Record<string, { name: string; symbol: string }>;
}

// OCR types
export interface OCRResult {
  receiptImageUrl: string;
  amount?: number;
  date?: string;
  merchantName?: string;
  description?: string;
}