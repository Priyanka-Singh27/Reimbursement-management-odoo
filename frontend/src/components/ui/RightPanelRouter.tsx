"use client";

import React from "react";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { format } from "date-fns";
import { X, CheckCircle2, MessageSquare, Clock, XCircle, AlertTriangle } from "lucide-react";
import { ExpenseEvent } from "../../store/expenseStore";

export function RightPanelRouter() {
  const { activeExpenseDetail, setActiveExpenseDetail } = useUiStore();
  const { company } = useAuthStore();

  if (!activeExpenseDetail) return null;

  const getEventIcon = (action: ExpenseEvent["action"]) => {
    switch(action) {
      case "Approved": return <CheckCircle2 size={16} className="text-[#2D6A4F]" />;
      case "Rejected": return <XCircle size={16} className="text-[#9B2335]" />;
      case "Commented": return <MessageSquare size={16} className="text-[#B5660A]" />;
      default: return <Clock size={16} className="text-[#888]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-[#F0FDF4] text-[#2D6A4F]";
      case "Rejected": return "bg-[#FFF0F0] text-[#9B2335]";
      default: return "bg-[#FFFBEB] text-[#B5660A]";
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream text-near-black">
      {/* Header */}
      <div className="p-6 border-b border-[#E2DDD6] flex items-start justify-between shrink-0 sticky top-0 bg-cream/95 backdrop-blur-sm z-10">
        <div>
          <h2 className="text-[20px] font-medium leading-tight mb-1">Expense Details</h2>
          <p className="text-[#888] text-[13px] font-mono">{activeExpenseDetail.id}</p>
        </div>
        <button 
          onClick={() => setActiveExpenseDetail(null)}
          className="p-1.5 hover:bg-[#E2DDD6] rounded-full text-[#888] hover:text-near-black transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Amount Hero */}
        <div className="text-center pb-6 border-b border-[#E2DDD6] border-dashed">
          <p className="text-[13px] uppercase tracking-[0.08em] font-semibold text-[#888] mb-2">Request Amount</p>
          <div className="font-mono text-[36px] font-[600] leading-none mb-3">
            {company?.defaultCurrency} {activeExpenseDetail.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className={`px-3 py-1 rounded-full text-[13px] font-medium tracking-wide inline-flex items-center gap-1.5 ${getStatusColor(activeExpenseDetail.status)}`}>
            {activeExpenseDetail.status}
          </span>
        </div>

        {/* Metadata Details */}
        <div className="space-y-4">
           <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#888]">Date</span>
              <span className="font-medium">{format(new Date(activeExpenseDetail.date), "MMM d, yyyy")}</span>
           </div>
           <div className="flex justify-between items-center text-[14px]">
              <span className="text-[#888]">Category</span>
              <span className="bg-[#E2DDD6] px-2 py-0.5 rounded-[4px] font-medium">{activeExpenseDetail.category}</span>
           </div>
           {activeExpenseDetail.currency !== company?.defaultCurrency && (
             <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#888]">Original Amount</span>
                <span className="font-mono">{activeExpenseDetail.currency} {activeExpenseDetail.amount.toLocaleString()}</span>
             </div>
           )}
           <div className="pt-2">
              <span className="text-[#888] text-[14px] block mb-1">Description</span>
              <p className="text-[15px] font-medium leading-relaxed">{activeExpenseDetail.description}</p>
           </div>
        </div>

        {/* Fraud Signals (if any) */}
        {activeExpenseDetail.fraudScore !== undefined && activeExpenseDetail.fraudScore > 0 && (
          <div className="bg-[#FEF3C7]/40 border-l-[2px] border-[#D97706] p-4 rounded-[6px]">
            <div className="flex gap-2 items-start mb-2">
               <AlertTriangle size={14} className="text-[#D97706] mt-0.5" />
               <h4 className="text-[14px] font-bold text-[#92400e] uppercase tracking-wider">Signals Detected ({activeExpenseDetail.fraudScore}/100)</h4>
            </div>
            <ul className="space-y-2 mt-2">
               {activeExpenseDetail.fraudSignals?.map((sig, idx) => (
                 <li key={idx} className="text-[13px] text-[#B45309] flex items-start gap-1.5 leading-tight">
                    <span className="w-1 h-1 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                    <span><strong>{sig.type.replace('_', ' ')}:</strong> {sig.reason}</span>
                 </li>
               ))}
            </ul>
          </div>
        )}

        {/* Receipt Thumbnail */}
        {activeExpenseDetail.receiptUrl && (
          <div className="space-y-2">
            <h3 className="text-[13px] text-[#888] uppercase tracking-[0.08em] font-semibold">Receipt Document</h3>
            <div className="border border-[#E2DDD6] rounded-[8px] overflow-hidden bg-[#f5f5f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeExpenseDetail.receiptUrl} alt="Receipt" className="w-full object-contain max-h-[160px]" />
              <div className="p-2 border-t border-[#E2DDD6] text-center">
                <a href={activeExpenseDetail.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-blue-600 hover:text-blue-800">
                  Open full receipt &nearr;
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Approval Timeline */}
        <div className="space-y-4 pb-8">
           <h3 className="text-[13px] text-[#888] uppercase tracking-[0.08em] font-semibold mb-4">Approval Timeline</h3>
           
           <div className="relative pl-4 border-l-2 border-[#E2DDD6] space-y-6">
              {activeExpenseDetail.timeline.map((event, index) => (
                <div key={event.id} className="relative">
                  {/* Timeline Node */}
                  <div className="absolute -left-[25px] flex items-center justify-center w-[16px] h-[16px] bg-cream border-2 border-cream">
                    <div className="flex items-center justify-center bg-white rounded-full">
                      {getEventIcon(event.action)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[14px] font-semibold text-near-black">{event.approverName}</span>
                      <span className="text-[12px] text-[#888]">{format(new Date(event.timestamp), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-[13px] font-medium text-[#666]">{event.action}</p>
                    {event.comment && (
                      <div className="mt-2 bg-white border border-[#E2DDD6] rounded-[6px] p-3 text-[14px] text-[#333] shadow-sm relative">
                        {/* Little chat bubble pointer */}
                        <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-l border-t border-[#E2DDD6] rotate-45" />
                        "{event.comment}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
