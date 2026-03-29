"use client";

import React from "react";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { format } from "date-fns";
import { X, CheckCircle2, MessageSquare, Clock, XCircle, AlertTriangle } from "lucide-react";
import { ExpenseEvent, Expense } from "../../store/expenseStore";

function ApprovalProgressTracker({ expense }: { expense: Expense }) {
  // Synthesize a full multi-level approval workflow chain for demonstration
  // In a real app this would be driven by the specific rules that struck the expense
  const workflowLabels = [
    { role: "Direct Manager", name: "Sarah Jenkins" },
    { role: "Finance Team", name: "Marcus Thorne" },
    { role: "SVP / Executive", name: "Elena Rodriguez" }
  ];
  
  // We match the real timeline events to our synthesized steps
  const steps = workflowLabels.map((lbl, idx) => {
    // If the timeline has an event that aligns with this index, we use it
    const pastEvent = expense.timeline[idx];
    
    // Determine status of this specific step
    let status: "Approved" | "Rejected" | "Pending" | "Upcoming" = "Upcoming";
    let timestamp = null;
    let actualName = lbl.name;
    
    if (pastEvent) {
      status = pastEvent.action === "Approved" ? "Approved" : pastEvent.action === "Rejected" ? "Rejected" : "Approved";
      timestamp = pastEvent.timestamp;
      actualName = pastEvent.approverName;
    } else {
      // If there's no past event for this node
      // If the expense is pending, the first one without a past event is "Pending", rest are "Upcoming"
      // If the expense is rejected, all remaining are skipped
      if (expense.status === "Rejected") status = "Upcoming"; // or Skipped
      else if (expense.status === "Pending" && (idx === 0 || expense.timeline.length === idx)) status = "Pending";
      else if (expense.status === "Approved") status = "Approved"; // edge case
    }
    
    return { ...lbl, name: actualName, status, timestamp, comment: pastEvent?.comment };
  });

  return (
    <div className="space-y-4 pb-8">
      <h3 className="text-[14px] text-[#888] uppercase tracking-[0.08em] font-semibold mb-4">Approval Progress</h3>
      
      <div className="relative border-l-[2px] border-[#E2DDD6] ml-[15px] space-y-7 pb-2">
        {steps.map((step, idx) => {
           let NodeIcon = <Clock size={14} className="text-[#888]" />;
           let nodeColor = "bg-white border-[#E2DDD6]";
           
           if (step.status === "Approved") {
              NodeIcon = <CheckCircle2 size={16} className="text-white" />;
              nodeColor = "bg-[#2D6A4F] border-[#2D6A4F]";
           } else if (step.status === "Rejected") {
              NodeIcon = <XCircle size={16} className="text-white" />;
              nodeColor = "bg-[#9B2335] border-[#9B2335]";
           } else if (step.status === "Pending") {
              NodeIcon = <div className="w-2.5 h-2.5 bg-[#B5660A] rounded-full animate-pulse" />;
              nodeColor = "bg-[#FFFBEB] border-[#D97706]";
           }

           return (
             <div key={idx} className="relative pl-8">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 flex items-center justify-center w-[32px] h-[32px] rounded-full border-[3px] shadow-sm z-10 transition-colors duration-300 ${nodeColor}`}>
                   {NodeIcon}
                </div>
                
                {/* Content */}
                <div className={`p-4 rounded-[8px] border transition-all duration-300 ${step.status === 'Pending' ? 'bg-white border-[#D97706] shadow-sm' : 'bg-transparent border-transparent'}`}>
                   <div className="flex justify-between items-start mb-1">
                      <div>
                         <p className={`text-[15px] font-semibold ${step.status === 'Upcoming' ? 'text-[#888]' : 'text-near-black'}`}>{step.name}</p>
                         <p className="text-[13px] text-[#888]">{step.role}</p>
                      </div>
                      <div className="text-right">
                        {step.status === "Approved" && <span className="bg-[#F0FDF4] text-[#2D6A4F] px-2 py-0.5 rounded-[4px] text-[12px] font-bold uppercase tracking-wider">Approved</span>}
                        {step.status === "Rejected" && <span className="bg-[#FFF0F0] text-[#9B2335] px-2 py-0.5 rounded-[4px] text-[12px] font-bold uppercase tracking-wider">Rejected</span>}
                        {step.status === "Pending" && <span className="bg-[#FEF3C7] text-[#B5660A] px-2 py-0.5 rounded-[4px] text-[12px] font-bold uppercase tracking-wider">Pending Review</span>}
                        {step.status === "Upcoming" && <span className="text-[#C8C3BB] text-[12px] font-bold uppercase tracking-wider">Upcoming</span>}
                      </div>
                   </div>
                   
                   {step.timestamp && (
                     <p className="text-[13px] text-[#666] mt-2 flex items-center gap-1.5">
                       <Clock size={12} /> {format(new Date(step.timestamp), "MMM d, yyyy h:mm a")}
                     </p>
                   )}
                   
                   {step.comment && (
                     <div className="mt-3 bg-[#FAFAFA] border border-[#E2DDD6] rounded-[6px] p-3 text-[14px] text-near-black italic relative shadow-sm">
                       <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#FAFAFA] border-l border-t border-[#E2DDD6] rotate-45" />
                       "{step.comment}"
                     </div>
                   )}
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}

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
          <h2 className="text-[21px] font-medium leading-tight mb-1">Expense Details</h2>
          <p className="text-[#888] text-[14px] font-mono">{activeExpenseDetail.id}</p>
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
          <p className="text-[14px] uppercase tracking-[0.08em] font-semibold text-[#888] mb-2">Request Amount</p>
          <div className="font-mono text-[37px] font-[600] leading-none mb-3">
            {company?.defaultCurrency} {activeExpenseDetail.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className={`px-3 py-1 rounded-full text-[14px] font-medium tracking-wide inline-flex items-center gap-1.5 ${getStatusColor(activeExpenseDetail.status)}`}>
            {activeExpenseDetail.status}
          </span>
        </div>

        {/* Metadata Details */}
        <div className="space-y-4">
           <div className="flex justify-between items-center text-[15px]">
              <span className="text-[#888]">Date</span>
              <span className="font-medium">{format(new Date(activeExpenseDetail.date), "MMM d, yyyy")}</span>
           </div>
           <div className="flex justify-between items-center text-[15px]">
              <span className="text-[#888]">Category</span>
              <span className="bg-[#E2DDD6] px-2 py-0.5 rounded-[4px] font-medium">{activeExpenseDetail.category}</span>
           </div>
           {activeExpenseDetail.currency !== company?.defaultCurrency && (
             <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#888]">Original Amount</span>
                <span className="font-mono">{activeExpenseDetail.currency} {activeExpenseDetail.amount.toLocaleString()}</span>
             </div>
           )}
           <div className="pt-2">
              <span className="text-[#888] text-[15px] block mb-1">Description</span>
              <p className="text-[16px] font-medium leading-relaxed">{activeExpenseDetail.description}</p>
           </div>
        </div>

        {/* Fraud Signals (if any) */}
        {activeExpenseDetail.fraudScore !== undefined && activeExpenseDetail.fraudScore > 0 && (
          <div className="bg-[#FEF3C7]/40 border-l-[2px] border-[#D97706] p-4 rounded-[6px]">
            <div className="flex gap-2 items-start mb-2">
               <AlertTriangle size={14} className="text-[#D97706] mt-0.5" />
               <h4 className="text-[15px] font-bold text-[#92400e] uppercase tracking-wider">Signals Detected ({activeExpenseDetail.fraudScore}/100)</h4>
            </div>
            <ul className="space-y-2 mt-2">
               {activeExpenseDetail.fraudSignals?.map((sig, idx) => (
                 <li key={idx} className="text-[14px] text-[#B45309] flex items-start gap-1.5 leading-tight">
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
            <h3 className="text-[14px] text-[#888] uppercase tracking-[0.08em] font-semibold">Receipt Document</h3>
            <div className="border border-[#E2DDD6] rounded-[8px] overflow-hidden bg-[#f5f5f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeExpenseDetail.receiptUrl} alt="Receipt" className="w-full object-contain max-h-[160px]" />
              <div className="p-2 border-t border-[#E2DDD6] text-center">
                <a href={activeExpenseDetail.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-blue-600 hover:text-blue-800">
                  Open full receipt &nearr;
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Approval Progress Tracker */}
        <ApprovalProgressTracker expense={activeExpenseDetail} />

      </div>
    </div>
  );
}
