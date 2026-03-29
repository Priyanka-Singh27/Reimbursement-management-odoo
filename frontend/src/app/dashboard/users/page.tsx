"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { 
  ShieldAlert, 
  Users, 
  Search, 
  MoreVertical,
  Plus,
  Mail,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "../../../components/ui/SharedStates";

// Mock user list since we don't have a userStore yet
const MOCK_USERS = [
  { id: "usr_1", name: "Priyanka Singh", email: "priyanka@example.com", role: "Admin", department: "Engineering", joinedDate: "2023-01-15T08:00:00.000Z", status: "Active" },
  { id: "usr_2", name: "David Kim", email: "david.k@example.com", role: "Manager", department: "Sales", joinedDate: "2023-03-22T08:00:00.000Z", status: "Active" },
  { id: "usr_3", name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Employee", department: "Marketing", joinedDate: "2023-06-10T08:00:00.000Z", status: "Active" },
  { id: "usr_4", name: "Michael Chen", email: "m.chen@example.com", role: "Manager", department: "Engineering", joinedDate: "2022-11-05T08:00:00.000Z", status: "Active" },
  { id: "usr_5", name: "Jessica Alba", email: "jessica@example.com", role: "Employee", department: "HR", joinedDate: "2024-01-08T08:00:00.000Z", status: "Active" },
  { id: "usr_6", name: "Tom Hardy", email: "tom.h@example.com", role: "Employee", department: "Sales", joinedDate: "2023-09-30T08:00:00.000Z", status: "Inactive" },
];

export default function UsersManagementPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  if (user?.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-near-black">
        <ShieldAlert size={48} className="text-[#9B2335] mb-4" />
        <h2 className="text-[21px] font-[500] tracking-tight">Access Denied</h2>
        <p className="text-[#888] text-[16px]">Only Administrators can access user management.</p>
      </div>
    );
  }

  const filteredUsers = MOCK_USERS.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "Admin": return <span className="bg-[#141414] text-white px-2 py-0.5 rounded-sm text-[13px] font-bold uppercase tracking-wider">Admin</span>;
      case "Manager": return <span className="bg-[#EFEFEB] border border-[#E2DDD6] text-near-black px-2 py-0.5 rounded-sm text-[13px] font-bold uppercase tracking-wider">Manager</span>;
      default: return <span className="bg-transparent border border-[#E2DDD6] text-[#666] px-2 py-0.5 rounded-sm text-[13px] font-bold uppercase tracking-wider">Employee</span>;
    }
  };

  return (
    <div className="flex-1 py-[40px] px-[48px] w-full flex flex-col min-h-0">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[29px] font-[400] text-near-black tracking-tight">User Management</h1>
          <p className="text-[16px] text-gray-500 mt-1">Manage employee accounts, roles, and department assignments.</p>
        </div>
        <button 
          className="bg-[#141414] text-white px-5 py-2.5 rounded-[10px] text-[16px] font-medium hover:bg-[#2a2a2a] transition-all flex items-center gap-2 active:scale-97"
        >
          <Plus size={16} /> Invite User
        </button>
      </div>

      <div className="bg-white border border-[#E2DDD6] rounded-[14px] shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E2DDD6] bg-[#FAFAFA] flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a39b]" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E2DDD6] rounded-[8px] h-[38px] pl-9 pr-[14px] text-[15px] text-near-black outline-none form-input-focus-ring placeholder:text-[#a8a39b] transition-all duration-150"
            />
          </div>
          
          <div className="flex p-1 bg-[#E2DDD6]/30 rounded-[10px] w-full sm:w-auto">
            {["All", "Admin", "Manager", "Employee"].map(filter => (
              <button
                key={filter}
                onClick={() => setRoleFilter(filter)}
                className={`py-1.5 px-4 text-[15px] font-medium rounded-[8px] transition-colors flex-1 sm:flex-none text-center
                  ${roleFilter === filter 
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
          {filteredUsers.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-white shadow-[0_1px_0_#E2DDD6] z-10">
                <tr className="text-[13px] text-[#888] font-semibold uppercase tracking-[0.05em]">
                  <th className="py-3 pl-6 pr-4 font-semibold w-[280px]">Employee details</th>
                  <th className="py-3 pr-4 font-semibold w-[160px]">Role</th>
                  <th className="py-3 pr-4 font-semibold w-[160px]">Department</th>
                  <th className="py-3 pr-4 font-semibold w-[160px]">Status</th>
                  <th className="py-3 pr-6 font-semibold w-[60px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr 
                    key={u.id} 
                    className={`border-b border-[#E2DDD6] hover:bg-[#FAFAFA] transition-colors h-[64px]
                      ${u.status === 'Inactive' ? 'opacity-60 bg-[#FAFAFA]' : ''}
                    `}
                  >
                    <td className="pl-6 pr-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EFEFEB] text-near-black flex items-center justify-center font-bold text-[15px] shrink-0 border border-[#E2DDD6]">
                          {u.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[16px] font-medium text-[#1a1a1a] leading-tight">{u.name} {u.id === user?.id && <span className="ml-1 text-[12px] text-[#666] font-normal">(You)</span>}</p>
                          <div className="flex items-center text-[14px] text-[#888] gap-1 mt-0.5">
                            <Mail size={10} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="pr-4 py-3">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="pr-4 py-3">
                      <div className="flex items-center gap-1.5 text-[15px] text-[#666]">
                        <Building2 size={14} className="text-[#a8a39b]" />
                        {u.department}
                      </div>
                    </td>
                    <td className="pr-4 py-3">
                      <span className={`flex items-center gap-1.5 text-[15px] font-medium
                        ${u.status === 'Active' ? 'text-[#2D6A4F]' : 'text-[#888]'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-[#2D6A4F]' : 'bg-[#888]'}`}></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="pr-6 py-3 text-right">
                      <button className="p-1.5 text-[#888] hover:text-near-black hover:bg-[#E2DDD6]/50 rounded-[6px] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col justify-center items-center py-20">
               <EmptyState 
                 icon={Users} 
                 heading="No users found" 
                 subtext="Try adjusting your filters or search terms." 
               />
            </div>
          )}
        </div>
        
        {/* Footer Stats */}
        <div className="bg-[#FAFAFA] border-t border-[#E2DDD6] p-4 px-6 flex justify-between items-center text-[15px] text-[#666]">
           <span>Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
           <span>Platform limits: 6 / 50 seats used</span>
        </div>

      </div>
    </div>
    </div>
  );
}
