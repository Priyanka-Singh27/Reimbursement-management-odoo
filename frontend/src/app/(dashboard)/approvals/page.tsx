"use client";

import React, { useState } from "react";
import { useExpenseStore, Expense } from "../../../store/expenseStore";
import { useAuthStore } from "../../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, 
  Check, 
  X, 
  Receipt,
  AlertTriangle,
  FileText
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { EmptyState } from "../../../components/ui/SharedStates";

export default function ApprovalsQueuePage() {
  const { expenses, updateExpenseStatus } = useExpenseStore();
  const { user, company } = useAuthStore();
  
  const [reviewingExpense, setReviewingExpense] = useState<Expense | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const pendingQueue = expenses.filter(e => 
    e.status === "Pending" && (user?.role === "Admin" || e.userId !== user?.id)
  );

  const handleApprove = () => {
    if (!user || !reviewingExpense) return;
    updateExpenseStatus(reviewingExpense.id, "Approved", {
      id: `evt_${Date.now()}`,
      approverId: user.id,
      approverName: user.name,
      action: "Approved",
      timestamp: new Date().toISOString()
    });
    setReviewingExpense(null);
  };

  const submitReject = () => {
    if (!user || !reviewingExpense || !rejectComment.trim()) return;

    updateExpenseStatus(reviewingExpense.id, "Rejected", {
      id: `evt_${Date.now()}`,
      approverId: user.id,
      approverName: user.name,
      action: "Rejected",
      comment: rejectComment,
      timestamp: new Date().toISOString()
    });
    setReviewingExpense(null);
    setRejectComment("");
  };

  if (user?.role === "Employee") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-near-black">
        <AlertTriangle size={48} className="text-[#9B2335] mb-4" />
        <h2 className="text-[20px] font-[500] tracking-tight">Access Denied</h2>
        <p className="text-[#888] text-[15px]">You do not have approval permissions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-[28px] font-[400] text-near-black tracking-tight">Approval Queue</h1>
          <p className="text-[15px] text-gray-500 mt-1">Review and process team reimbursement requests.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-[8px] border border-[#E2DDD6] text-[14px] font-medium shadow-sm flex items-center gap-2 text-near-black">
          <span>Pending Items:</span>
          <span className="bg-[#141414] text-white px-2 py-0.5 rounded-[4px]">{pendingQueue.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {pendingQueue.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-white border border-[#E2DDD6] border-dashed rounded-[14px] p-12 text-center text-[#888] flex flex-col items-center"
            >
              <EmptyState 
                icon={CheckSquare} 
                heading="Queue Empty" 
                subtext="You're all caught up. No pending expenses require your approval right now." 
              />
            </motion.div>
          )}

          {pendingQueue.map((expense) => (
            <motion.div
              layout
              key={expense.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white border border-[#E2DDD6] rounded-[16px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EFEFEB] text-near-black flex items-center justify-center font-bold text-[18px] shrink-0 border border-[#E2DDD6] overflow-hidden">
                    {expense.userId.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-medium text-near-black mb-0.5">{expense.userId}</h3>
                    <p className="text-[15px] text-[#666] line-clamp-1 max-w-[300px]">{expense.description}</p>
                    <div className="flex gap-2 items-center mt-2.5">
                      <span className="px-2 py-0.5 bg-[#E2DDD6]/50 text-[#666] rounded-[4px] text-[12px] font-medium tracking-wide">
                        {expense.category}
                      </span>
                      <span className="text-[#888] text-[13px]">{format(new Date(expense.date), "MMM dd")}</span>
                      {expense.fraudScore !== undefined && expense.fraudScore >= 50 && (
                         <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] text-[#B5660A] rounded-[4px] text-[12px] font-bold tracking-wide border border-[#D97706]/30">
                            <AlertTriangle size={10} /> FRAUD RISK {expense.fraudScore}
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#E2DDD6]">
                  <div className="text-left sm:text-right">
                    <p className="text-[20px] font-mono font-[600] text-near-black leading-none mb-1">
                      {company?.defaultCurrency} {expense.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {expense.currency !== company?.defaultCurrency && (
                      <p className="text-[13px] text-[#888] font-mono">
                        ({expense.currency} {expense.amount.toFixed(2)})
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setReviewingExpense(expense)}
                    className="px-6 py-2.5 bg-[#141414] text-white font-medium text-[15px] rounded-[10px] transition-colors hover:bg-[#2a2a2a] whitespace-nowrap active:scale-97"
                  >
                    Review
                  </button>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 720px Review Modal */}
      <Dialog.Root open={!!reviewingExpense} onOpenChange={(open) => !open && setReviewingExpense(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[#EFEFEB]/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[720px] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] bg-white shadow-2xl rounded-[16px] outline-none flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            
            <div className="px-8 py-5 border-b border-[#E2DDD6] flex justify-between items-center bg-[#F7F4EF] shrink-0">
              <Dialog.Title className="text-[20px] font-medium text-near-black flex items-center gap-2">
                <FileText size={18} className="text-[#888]" />
                Review Expense Request
              </Dialog.Title>
              <Dialog.Close className="text-[#888] hover:text-near-black transition-colors rounded-full p-2 hover:bg-[#E2DDD6]">
                <X size={20} />
              </Dialog.Close>
            </div>
            
            <div className="overflow-y-auto flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Review Details Left */}
              <div className="space-y-6">
                <div>
                  <p className="text-[12px] uppercase tracking-wider font-semibold text-[#888] mb-1">Employee</p>
                  <p className="text-[18px] font-medium text-near-black">{reviewingExpense?.userId}</p>
                </div>
                
                <div>
                   <p className="text-[12px] uppercase tracking-wider font-semibold text-[#888] mb-1">Requested Amount</p>
                   <p className="text-[32px] font-mono font-[600] text-near-black leading-none">
                     {company?.defaultCurrency} {reviewingExpense?.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </p>
                   {reviewingExpense?.currency !== company?.defaultCurrency && (
                     <p className="text-[14px] text-[#666] font-mono mt-1">
                       Original: {reviewingExpense?.currency} {reviewingExpense?.amount}
                     </p>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#FAFAFA] border border-[#E2DDD6] rounded-[8px] p-4">
                   <div>
                     <p className="text-[12px] uppercase tracking-wider font-semibold text-[#888] mb-1">Date</p>
                     <p className="text-[15px] font-medium text-near-black">{reviewingExpense ? format(new Date(reviewingExpense.date), "MMM do, yyyy") : ""}</p>
                   </div>
                   <div>
                     <p className="text-[12px] uppercase tracking-wider font-semibold text-[#888] mb-1">Category</p>
                     <span className="bg-[#E2DDD6] px-2 py-0.5 rounded-[4px] text-[13px] font-medium text-[#666]">{reviewingExpense?.category}</span>
                   </div>
                </div>

                <div>
                   <p className="text-[12px] uppercase tracking-wider font-semibold text-[#888] mb-1">Description</p>
                   <p className="text-[15px] text-near-black leading-relaxed">{reviewingExpense?.description}</p>
                </div>

                {reviewingExpense?.fraudScore !== undefined && reviewingExpense.fraudScore >= 50 && (
                   <div className="bg-[#FEF3C7] border border-[#D97706]/40 rounded-[8px] p-4">
                      <div className="flex items-center gap-2 mb-2">
                         <AlertTriangle size={16} className="text-[#D97706]" />
                         <span className="text-[14px] font-bold text-[#92400e] uppercase tracking-wider">Signals Found (Score: {reviewingExpense.fraudScore})</span>
                      </div>
                      <ul className="space-y-1">
                         {reviewingExpense.fraudSignals?.map((sig, i) => (
                           <li key={i} className="text-[14px] text-[#B45309] flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                              <span>{sig.reason}</span>
                           </li>
                         ))}
                      </ul>
                   </div>
                )}
              </div>

              {/* Receipt Visual Right */}
              <div>
                 <p className="text-[12px] uppercase tracking-wider font-semibold text-[#888] mb-2">Attached Receipt</p>
                 {reviewingExpense?.receiptUrl ? (
                   <div className="bg-[#f5f5f5] border border-[#E2DDD6] rounded-[8px] h-full min-h-[300px] flex items-center justify-center overflow-hidden">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={reviewingExpense.receiptUrl} alt="Receipt" className="max-w-full max-h-[400px] object-contain" />
                   </div>
                 ) : (
                   <div className="bg-[#FAFAFA] border border-[#E2DDD6] border-dashed rounded-[8px] h-[300px] flex flex-col items-center justify-center text-[#888]">
                     <Receipt size={32} className="mb-2 opacity-50" />
                     <p className="text-[14px] font-medium">No receipt provided</p>
                   </div>
                 )}
              </div>

            </div>

            {/* Action Footer */}
            <div className="p-6 pt-0 mt-auto bg-white border-t border-[#E2DDD6] shrink-0">
               <div className="flex flex-col gap-4 pt-6">
                 <div>
                    <label htmlFor="reason" className="block text-[14px] font-semibold text-near-black mb-1">Action Comment (Required for Rejection)</label>
                    <textarea
                      id="reason"
                      rows={2}
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="e.g., Requesting itemized receipt."
                      className="w-full bg-[#FAFAFA] border border-[#E2DDD6] rounded-[8px] p-3 text-[15px] text-near-black outline-none focus:border-[#141414] transition-all resize-none form-input-focus-ring"
                    />
                 </div>
                 <div className="flex gap-3 justify-end">
                    <button 
                      onClick={submitReject}
                      disabled={!rejectComment.trim()}
                      className="px-6 py-2.5 bg-white border border-[#E2DDD6] text-[#9B2335] text-[15px] font-medium rounded-[10px] hover:bg-[#FFF0F0] hover:border-[#F8D7DA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <X size={16} /> Reject
                    </button>
                    <button 
                      onClick={handleApprove}
                      className="px-6 py-2.5 bg-[#2D6A4F] text-white text-[15px] font-medium rounded-[10px] hover:bg-[#1f4a37] transition-colors flex items-center gap-2"
                    >
                      <Check size={16} /> Approve Amount
                    </button>
                 </div>
               </div>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}
