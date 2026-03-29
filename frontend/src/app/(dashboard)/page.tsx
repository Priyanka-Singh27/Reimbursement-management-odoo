"use client";

import React, { useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useExpenseStore } from "../../store/expenseStore";
import { useRuleStore } from "../../store/ruleStore";
import { format } from "date-fns";
import { 
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, company } = useAuthStore();
  const { expenses } = useExpenseStore();
  const { rules } = useRuleStore();

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

  const dashboardVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (!user) return null;

  const greeting = `Good morning, ${user.name.split(" ")[0]}`;
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  // --- STAT CALCULATIONS ---
  const myExpenses = expenses.filter(e => e.userId === user.id);
  const myTotalSubmitted = myExpenses.length;
  const myApprovedAmount = myExpenses.filter(e => e.status === "Approved").reduce((sum, e) => sum + e.convertedAmount, 0);
  const myPendingCount = myExpenses.filter(e => e.status === "Pending").length;
  const myRejectedCount = myExpenses.filter(e => e.status === "Rejected").length;

  const teamPending = expenses.filter(e => e.status === "Pending" && e.userId !== user.id).length;
  const teamApprovedToday = 14; // Mocked
  
  const totalEmployees = 124; // Mocked

  const renderStatCard = (colorClass: string, label: string, amount: string | number, sub: string, Icon: any) => (
    <motion.div 
      variants={cardVariants}
      className={`${colorClass} rounded-[14px] p-6 relative overflow-hidden`}
    >
      <div className="relative z-10 flex flex-col h-full justify-between">
        <h4 className="text-[13px] uppercase tracking-[0.07em] text-[#666] font-semibold mb-2">{label}</h4>
        <div>
          <p className="text-[29px] font-[600] text-near-black font-mono leading-none mb-1">{amount}</p>
          <p className="text-[14px] text-[#888] font-medium">{sub}</p>
        </div>
      </div>
      <Icon size={80} className="absolute -bottom-4 -right-4 text-near-black opacity-10 pointer-events-none" />
    </motion.div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-[33px] font-[400] text-[#1a1a1a] tracking-tight">{greeting}</h1>
        <p className="text-[14px] text-gray-500 font-medium mt-1 uppercase tracking-wider">{today}</p>
      </div>

      {user.role === "Admin" && (
        <motion.div variants={dashboardVariants} initial="hidden" animate="show">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {renderStatCard("bg-[#EDD9A3]", "TOTAL EMPLOYEES", totalEmployees, "active accounts", Users)}
            {renderStatCard("bg-[#C8D5B9]", "PENDING APPROVALS", teamPending, "awaiting review", Clock)}
            {renderStatCard("bg-[#E8C4C4]", "THIS MONTH", `${company?.defaultCurrency} 45K`, "total corporate spend", Receipt)}
            {renderStatCard("bg-[#B8D4E3]", "ACTIVE RULES", rules.length, "routing policies", CheckCircle)}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[21px] font-[500] text-[#1a1a1a]">Recent Expenses</h2>
                  <Link href="/dashboard/team-expenses" className="text-[16px] font-medium text-[#666] hover:text-[#1a1a1a] transition-colors">View all &rarr;</Link>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2DDD6] text-[14px] text-[#888] font-medium uppercase tracking-wider">
                      <th className="pb-3 pr-4 font-medium">Employee</th>
                      <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Date</th>
                      <th className="pb-3 pr-4 font-medium">Description</th>
                      <th className="pb-3 pr-4 font-medium hidden md:table-cell">Category</th>
                      <th className="pb-3 pr-4 font-medium text-right">Amount</th>
                      <th className="pb-3 pl-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 5).map(exp => (
                      <tr key={exp.id} className="border-b border-[#E2DDD6] hover:bg-white/40 transition-colors h-[52px]">
                        <td className="pr-4 py-2 font-medium text-[16px] text-[#333]">{exp.userId}</td>
                        <td className="pr-4 py-2 text-[16px] text-[#666] hidden sm:table-cell">{format(new Date(exp.date), "MMM d")}</td>
                        <td className="pr-4 py-2 text-[16px] text-[#333] font-medium truncate max-w-[150px]">{exp.description}</td>
                        <td className="pr-4 py-2 hidden md:table-cell">
                          <span className="bg-[#E2DDD6] px-2 py-0.5 rounded-[4px] text-[13px] font-medium text-[#666]">{exp.category}</span>
                        </td>
                        <td className="pr-4 py-2 text-[16px] font-mono font-medium text-[#1a1a1a] text-right">
                          {company?.defaultCurrency} {exp.convertedAmount.toLocaleString()}
                        </td>
                        <td className="pl-4 py-2">{getStatusPill(exp.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
             
             <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[21px] font-[500] text-[#1a1a1a]">Approval Rules</h2>
                  <Link href="/dashboard/rules" className="text-[16px] font-medium text-[#666] hover:text-[#1a1a1a] transition-colors">Manage &rarr;</Link>
                </div>
                <div className="space-y-3">
                   {rules.map(rule => (
                      <div key={rule.id} className="bg-white border border-[#E2DDD6] rounded-[12px] p-4 flex justify-between items-center">
                         <div>
                            <p className="font-medium text-[#1a1a1a] text-[16px]">{rule.name}</p>
                            <p className="text-[#888] text-[14px] mt-0.5">{rule.steps.length} step(s) logic</p>
                         </div>
                         <span className="bg-[#141414] text-white px-2 py-0.5 rounded-[4px] text-[13px] font-medium tracking-wide">
                            {rule.conditions.length > 0 ? "CONDITIONAL" : "SEQUENTIAL"}
                         </span>
                      </div>
                   ))}
                </div>
                <Link href="/dashboard/rules" className="block w-full py-3 mt-4 text-center border border-[#E2DDD6] border-dashed rounded-[10px] text-[16px] font-medium text-[#666] hover:text-[#1a1a1a] hover:bg-white/50 transition-colors">
                   + New Rule
                </Link>
             </div>
          </div>
        </motion.div>
      )}

      {user.role === "Manager" && (
        <motion.div variants={dashboardVariants} initial="hidden" animate="show" className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderStatCard("bg-[#EDD9A3]", "PENDING REVIEW", teamPending, "awaiting action", Clock)}
            {renderStatCard("bg-[#C8D5B9]", "APPROVED TODAY", teamApprovedToday, "reimbursed", CheckCircle)}
            {renderStatCard("bg-[#B8D4E3]", "AVG RESPONSE", "4.2h", "time to approval", Receipt)}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-[21px] font-[500] text-[#1a1a1a]">Approval Queue Spotlight</h2>
              <Link href="/dashboard/approvals" className="text-[16px] font-medium text-[#666] hover:text-[#1a1a1a] transition-colors">View all &rarr;</Link>
            </div>
            
            <div className="space-y-3">
               {expenses.filter(e => e.status === "Pending" && e.userId !== user.id).slice(0,3).map(exp => (
                  <div key={exp.id} className="bg-white border border-[#E2DDD6] rounded-[12px] p-[20px] flex sm:items-center justify-between hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex-col sm:flex-row gap-4 sm:gap-0">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8C4C4] text-[#9B2335] flex items-center justify-center font-bold text-[16px] shrink-0">
                           {exp.userId.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                           <p className="font-medium text-[#1a1a1a] text-[16px]">{exp.userId}</p>
                           <p className="text-[#666] text-[16px] truncate max-w-[200px]">{exp.description}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="font-mono text-[21px] font-[600] text-[#1a1a1a]">{company?.defaultCurrency} {exp.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                           <p className="text-[#888] text-[14px] font-medium">{format(new Date(exp.date), "MMM d, yyyy")}</p>
                        </div>
                        <Link href="/dashboard/approvals" className="bg-[#141414] text-white px-4 py-2 rounded-[10px] text-[16px] font-medium hover:bg-[#2a2a2a] transition-transform active:scale-97">
                           Review
                        </Link>
                     </div>
                  </div>
               ))}
               {expenses.filter(e => e.status === "Pending" && e.userId !== user.id).length === 0 && (
                 <div className="text-center py-10 text-[#888]">
                   <p>Queue empty.</p>
                 </div>
               )}
            </div>
          </div>
        </motion.div>
      )}

      {user.role === "Employee" && (
        <motion.div variants={dashboardVariants} initial="hidden" animate="show" className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {renderStatCard("bg-[#EDD9A3]", "TOTAL SUBMITTED", myTotalSubmitted, "lifetime", Receipt)}
            {renderStatCard("bg-[#C8D5B9]", "APPROVED", `${company?.defaultCurrency} ${myApprovedAmount.toLocaleString()}`, "reimbursed", CheckCircle)}
            {renderStatCard("bg-[#E8C4C4]", "PENDING REVIEW", myPendingCount, "awaiting action", Clock)}
            {renderStatCard("bg-[#B8D4E3]", "REJECTED", myRejectedCount, "needs revision", XCircle)}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[21px] font-[500] text-[#1a1a1a]">Recent Expenses</h2>
              <Link href="/dashboard/my-expenses" className="text-[16px] font-medium text-[#666] hover:text-[#1a1a1a] transition-colors">View all &rarr;</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#E2DDD6] text-[14px] text-[#888] font-medium uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-3 pl-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myExpenses.slice(0, 5).map(exp => (
                    <tr key={exp.id} className="border-b border-[#E2DDD6] hover:bg-white/40 transition-colors h-[52px]">
                      <td className="pr-4 py-2 text-[16px] text-[#666] whitespace-nowrap">{format(new Date(exp.date), "MMM d, yyyy")}</td>
                      <td className="pr-4 py-2 text-[16px] text-[#333] font-medium truncate max-w-[250px]">{exp.description}</td>
                      <td className="pr-4 py-2">
                        <span className="bg-[#E2DDD6] px-2 py-0.5 rounded-[4px] text-[13px] font-medium text-[#666]">{exp.category}</span>
                      </td>
                      <td className="pr-4 py-2 text-[16px] font-mono font-medium text-[#1a1a1a] text-right whitespace-nowrap">
                        {company?.defaultCurrency} {exp.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="pl-4 py-2">{getStatusPill(exp.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myExpenses.length === 0 && (
                 <div className="text-center py-16">
                    <AlertTriangle size={48} className="mx-auto text-[#D0CBC3] mb-4" />
                    <h3 className="text-[21px] font-medium text-[#1a1a1a] mb-1">No expenses yet</h3>
                    <p className="text-[16px] text-[#666] mb-6">You haven't submitted any expenses yet.</p>
                    <Link href="/dashboard/submit" className="bg-[#141414] text-white px-5 py-2.5 rounded-[10px] text-[16px] font-medium hover:bg-[#2a2a2a] transition-transform active:scale-97">
                      Submit your first expense
                    </Link>
                 </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
