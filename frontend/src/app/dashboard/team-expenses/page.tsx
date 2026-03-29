"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useExpenseStore, Expense } from "../../../store/expenseStore";
import { useUiStore } from "../../../store/uiStore";
import { EmptyState } from "../../../components/ui/SharedStates";
import { format } from "date-fns";
import { 
  Search, 
  Users,
  CheckCircle2,
  XCircle,
  Receipt,
  Paperclip,
  TrendingDown
} from "lucide-react";
import { motion } from "framer-motion";

export default function TeamExpensesPage() {
  const { user, company } = useAuthStore();
  const { expenses } = useExpenseStore();
  const { setActiveExpenseDetail, activeExpenseDetail } = useUiStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  if (!user || user.role === "Employee") return null;

  // Managers and Admins see expenses not submitted by themselves (since this is "Team")
  // Or if Admin, maybe see all? Let's assume team expenses = others for Manager, all for Admin.
  const teamExpenses = user.role === "Admin" ? expenses : expenses.filter(e => e.userId !== user.id);

  const filteredExpenses = teamExpenses.filter(e => {
    const matchesSearch = e.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusPill = (status: string) => {
    switch (status) {
      case "Approved": return (
        <span className="flex items-center gap-1.5 bg-[#F0FDF4] text-[#2D6A4F] px-2.5 py-1 rounded-full text-[14px] font-medium w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]"></span> Approved
        </span>
      );
      case "Rejected": return (
        <span className="flex items-center gap-1.5 bg-[#FFF0F0] text-[#9B2335] px-2.5 py-1 rounded-full text-[14px] font-medium w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9B2335]"></span> Rejected
        </span>
      );
      default: return (
        <span className="flex items-center gap-1.5 bg-[#FFFBEB] text-[#B5660A] px-2.5 py-1 rounded-full text-[14px] font-medium w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B5660A]"></span> Pending
        </span>
      );
    }
  };

  return (
    <div className="flex-1 py-[40px] px-[48px] w-full flex flex-col min-h-0">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[29px] font-[400] text-near-black tracking-tight">Team Expenses</h1>
          <p className="text-[16px] text-gray-500 mt-1">Audit and review the broader team's spending log.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2DDD6] rounded-[14px] shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E2DDD6] bg-[#FAFAFA] flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a39b]" />
            <input
              type="text"
              placeholder="Search by name, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E2DDD6] rounded-[8px] h-[38px] pl-9 pr-[14px] text-[15px] text-near-black outline-none form-input-focus-ring placeholder:text-[#a8a39b] transition-all duration-150"
            />
          </div>
          
          <div className="flex p-1 bg-[#E2DDD6]/30 rounded-[10px] w-full sm:w-auto">
            {["All", "Pending", "Approved", "Rejected"].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`py-1.5 px-4 text-[15px] font-medium rounded-[8px] transition-colors flex-1 sm:flex-none text-center
                  ${statusFilter === filter 
                    ? 'bg-near-black text-white shadow-sm' 
                    : 'bg-transparent text-[#666] hover:text-near-black hover:bg-white/50'
                  }
                `}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white">
          {filteredExpenses.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-white shadow-[0_1px_0_#E2DDD6]">
                <tr className="text-[13px] text-[#888] font-semibold uppercase tracking-[0.05em]">
                  <th className="py-3 pl-6 pr-4 font-semibold w-[160px]">Employee</th>
                  <th className="py-3 pr-4 font-semibold w-[140px]">Date</th>
                  <th className="py-3 pr-4 font-semibold">Description</th>
                  <th className="py-3 pr-4 font-semibold w-[120px]">Category</th>
                  <th className="py-3 pr-4 font-semibold text-right w-[140px]">Amount</th>
                  <th className="py-3 pr-4 font-semibold w-[140px] pl-6">Status</th>
                  <th className="py-3 pr-6 font-semibold w-[60px] text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp: Expense) => {
                  const isActive = activeExpenseDetail?.id === exp.id;
                  return (
                    <tr 
                      key={exp.id} 
                      onClick={() => setActiveExpenseDetail(isActive ? null : exp)}
                      className={`border-b border-[#E2DDD6] hover:bg-[#FAFAFA] transition-colors h-[56px] cursor-pointer
                        ${isActive ? "bg-[#F7F4EF] hover:bg-[#F7F4EF]" : ""}
                      `}
                    >
                      <td className="pl-6 pr-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#C8C3BB] text-white flex items-center justify-center text-[12px] font-bold">
                            {exp.userId.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[16px] font-medium text-[#1a1a1a]">{exp.userId}</span>
                        </div>
                      </td>
                      <td className="pr-4 py-2 text-[16px] text-[#666] whitespace-nowrap">{format(new Date(exp.date), "MMM d, yyyy")}</td>
                      <td className="pr-4 py-2 text-[16px] text-[#1a1a1a] font-medium truncate max-w-[200px]">
                        {exp.description}
                        {isActive && <span className="ml-2 text-[12px] uppercase text-[#B5660A] font-bold tracking-wider inline-block border border-[#D97706]/30 bg-[#FEF3C7]/50 px-1.5 rounded-sm">Viewing</span>}
                      </td>
                      <td className="pr-4 py-2">
                        <span className="bg-[#E2DDD6] px-2 py-0.5 rounded-[4px] text-[13px] font-medium text-[#666]">{exp.category}</span>
                      </td>
                      <td className="pr-4 py-2 text-[17px] font-mono font-medium text-near-black text-right whitespace-nowrap">
                        {company?.defaultCurrency} {exp.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="pl-6 pr-4 py-2">{getStatusPill(exp.status)}</td>
                      <td className="pr-6 py-2 text-center text-[#888]">
                        {exp.receiptUrl ? <Paperclip size={16} className="inline" /> : <span className="opacity-30">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col justify-center items-center">
               <EmptyState 
                 icon={Users} 
                 heading="No team expenses found" 
                 subtext="Try adjusting your filters or search terms." 
               />
            </div>
          )}
        </div>
        
        {/* Footer Stats */}
        <div className="bg-[#FAFAFA] border-t border-[#E2DDD6] p-4 px-6 flex justify-between items-center text-[15px] text-[#666]">
           <span>Showing {filteredExpenses.length} request{filteredExpenses.length !== 1 ? 's' : ''}</span>
           <span className="font-medium text-near-black">
             Total: {company?.defaultCurrency} {filteredExpenses.reduce((sum, e) => sum + e.convertedAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </span>
        </div>

      </div>
    </div>
    </div>
  );
}
