"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useUiStore } from "../../../store/uiStore";
import { useAuthStore } from "../../../store/authStore";
import * as Switch from "@radix-ui/react-switch";
import { 
  Lock, Trash2, Plus, GripVertical, Check, UploadCloud, X, AlertTriangle, RefreshCw
} from "lucide-react";

// --- REUSABLE COMPONENTS ---

const Section = ({ title, delayIndex, children }: { title: string, delayIndex: number, children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delayIndex * 0.06, duration: 0.4 }}
    className="mb-[40px] last:mb-0 relative"
  >
    <h2 className="text-[13px] uppercase tracking-[0.07em] text-[#666] mb-[16px] font-semibold">{title}</h2>
    <div className="bg-[#FFFFFF] border border-[#E2DDD6] rounded-[12px] p-[24px]">
      {children}
    </div>
  </motion.div>
);

const Divider = () => <div className="h-[1px] bg-[#E2DDD6] w-full my-[40px]" />;

const Input = ({ label, type = "text", value, onChange, placeholder, prefix, suffix, readOnly, className = "" }: any) => (
  <div className={className}>
    {label && <label className="block text-[14px] font-medium text-near-black mb-1.5">{label}</label>}
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-[#666] font-mono text-[15px]">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full bg-[#FFFFFF] border border-[#E2DDD6] rounded-[8px] h-[44px] text-[15px] text-near-black outline-none transition-all placeholder:text-[#a8a39b]
          focus:border-[#141414] focus:ring-[3px] focus:ring-[#141414]/[0.06]
          ${prefix ? 'pl-[30px]' : 'px-[14px]'}
          ${type === "number" ? 'font-mono uppercase' : ''}
          ${readOnly ? 'bg-[#FAFAFA] text-[#666] cursor-not-allowed border-[#E2DDD6]/60 focus:ring-0 focus:border-[#E2DDD6]/60' : ''}
        `}
      />
      {suffix && <span className="absolute right-3 text-[#888] flex items-center">{suffix}</span>}
    </div>
  </div>
);

const ToggleRow = ({ label, description, checked, onCheckedChange }: any) => (
  <div className="flex justify-between items-start pt-[20px] pb-[4px] border-t border-[#E2DDD6] mt-[20px] first:mt-0 first:border-0 first:pt-0">
    <div className="pr-6">
      <p className="text-[15px] font-medium text-near-black">{label}</p>
      {description && <p className="text-[14px] text-[#888] mt-1 line-clamp-2 leading-snug">{description}</p>}
    </div>
    <Switch.Root 
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="shrink-0 w-[36px] h-[20px] bg-[#E2DDD6] rounded-full relative data-[state=checked]:bg-[#141414] outline-none cursor-pointer transition-colors"
    >
      <Switch.Thumb className="block w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform translate-x-[2px] data-[state=checked]:translate-x-[18px]" />
    </Switch.Root>
  </div>
);

export default function SettingsPage() {
  const { setActiveExpenseDetail } = useUiStore();
  const { company } = useAuthStore();
  
  useEffect(() => {
    setActiveExpenseDetail(null);
  }, [setActiveExpenseDetail]);

  // --- LOCAL STATE (INITIAL) ---
  const initialData = {
    companyName: company?.name || "Acme Corp",
    industry: "Technology",
    registrationNo: "GSTIN-08AABCU",
    logo: null,
    
    autoApproveBelow: 1500,
    preApproveAbove: 10000,
    requireManagerAll: true,
    allowResubmit: true,
    
    duplicateDetection: true,
    fuzzyDateDays: 3,
    fuzzyAmountPercent: 10,
    velocityLimit: 8,
    autoBlockThreshold: 85,
    
    scoreSoftWarn: 30,
    scoreBlock: 85,

    notifications: {
      submitted: { emp: true, mgr: true, adm: false },
      approved: { emp: true, mgr: false, adm: false },
      rejected: { emp: true, mgr: false, adm: false },
      overdue: { emp: false, mgr: true, adm: true },
      duplicate: { emp: false, mgr: true, adm: true },
      newUser: { emp: false, mgr: false, adm: true },
    }
  };

  const [initialDataState, setInitialDataState] = useState(initialData);

  const [formData, setFormData] = useState(initialDataState);
  const [categories, setCategories] = useState([
    { id: '1', name: 'Travel', budget: 50000, active: true, color: '#3B82F6' },
    { id: '2', name: 'Food & Dining', budget: 20000, active: true, color: '#F59E0B' },
    { id: '3', name: 'Supplies', budget: 15000, active: true, color: '#10B981' },
    { id: '4', name: 'Software', budget: 10000, active: true, color: '#6366F1' },
  ]);
  const [initialCategories, setInitialCategories] = useState([...categories]);

  const [deleteConfirms, setDeleteConfirms] = useState<{ [key: string]: boolean }>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialDataState) || JSON.stringify(categories) !== JSON.stringify(initialCategories);

  const updateForm = (key: string, val: any) => setFormData(p => ({ ...p, [key]: val }));
  
  const updateNotif = (row: string, col: string) => {
    setFormData(p => ({
      ...p,
      notifications: {
        ...p.notifications,
        // @ts-ignore
        [row]: { ...p.notifications[row], [col]: !p.notifications[row][col] }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800)); // fake delay
    setIsSaving(false);
    setHasSaved(true);
    setTimeout(() => {
      setHasSaved(false);
      // Reset initial data manually matching what was saved
      // In a real app we'd dispatch to a store
      setInitialDataState({...formData});
      setInitialCategories(categories.map(c => ({...c})));
    }, 2000);
  };

  return (
    <div className="flex-1 py-[40px] px-[48px] w-full flex flex-col min-h-0 bg-[#F7F4EF] font-sans">
      <div className="max-w-[720px] w-full text-left pb-32 mx-auto">
        
        {/* HEADER */}
        <div className="mb-[40px]">
          <h1 className="text-[32px] font-[400] text-near-black tracking-tight leading-none mb-1">Settings</h1>
          <p className="text-[14px] text-[#888]">Manage your company configuration</p>
        </div>

        {/* SEC 1: COMPANY PROFILE */}
        <Section title="Company Profile" delayIndex={0}>
          <div className="grid grid-cols-2 gap-[16px] mb-6">
            <Input label="Company Name" value={formData.companyName} onChange={(e: any) => updateForm('companyName', e.target.value)} />
            <div>
              <label className="block text-[14px] font-medium text-near-black mb-1.5">Industry</label>
              <select 
                value={formData.industry} 
                onChange={e => updateForm('industry', e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2DDD6] rounded-[8px] h-[44px] px-[14px] text-[15px] text-near-black outline-none transition-all focus:border-[#141414] focus:ring-[3px] focus:ring-[#141414]/[0.06]"
              >
                {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Other"].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <Input label="Country" value="United States" readOnly suffix={<Lock size={14} className="opacity-50" />} />
            <Input label="Registration Number" value={formData.registrationNo} onChange={(e: any) => updateForm('registrationNo', e.target.value)} />
          </div>

          <div className="mb-6">
            <label className="block text-[14px] font-medium text-near-black mb-1.5">Default Currency</label>
            <div className="inline-flex items-center gap-2 bg-[#FAFAFA] border border-[#E2DDD6] text-[#666] px-3 py-1.5 rounded-full text-[14px] font-medium cursor-help" title="Base currency cannot be changed after company setup. Contact support to migrate.">
              {company?.defaultCurrency || "USD"} — US Dollar <Lock size={12} className="text-[#a8a39b] ml-1" />
            </div>
          </div>

          <div>
             <label className="block text-[14px] font-medium text-near-black mb-1.5">Company Logo</label>
             <div className="group relative w-[72px] h-[72px] border border-[#C8C3BB] border-dashed rounded-[12px] bg-[#FAFAFA] flex items-center justify-center text-[20px] font-bold text-[#C8C3BB] cursor-pointer hover:border-[#141414] hover:text-[#141414] transition-colors overflow-hidden">
                {!formData.logo ? (
                  formData.companyName.charAt(0).toUpperCase()
                ) : (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <UploadCloud size={18} />
                </div>
             </div>
             <p className="text-[12px] text-[#888] mt-2">Recommended: 256x256px PNG transparent.</p>
          </div>
        </Section>

        <Divider />

        {/* SEC 2: APPROVAL POLICY */}
        <Section title="Approval Policy Defaults" delayIndex={1}>
          <div className="grid grid-cols-2 gap-[16px] mb-6">
             <Input label="Auto-approve below" type="number" prefix="₹" value={formData.autoApproveBelow} onChange={(e: any) => updateForm('autoApproveBelow', Number(e.target.value))} />
             <Input label="Require pre-approval above" type="number" prefix="₹" value={formData.preApproveAbove} onChange={(e: any) => updateForm('preApproveAbove', Number(e.target.value))} />
          </div>
          <ToggleRow label="Require manager pre-approval for all expenses" description="Disables auto-approval entirely regardless of amount threshold." checked={formData.requireManagerAll} onCheckedChange={(v: boolean) => updateForm('requireManagerAll', v)} />
          <ToggleRow label="Allow employees to resubmit rejected expenses" description="If off, new submissions must be created from scratch instead." checked={formData.allowResubmit} onCheckedChange={(v: boolean) => updateForm('allowResubmit', v)} />
        </Section>

        <Divider />

        {/* SEC 3: EXPENSE CATEGORIES */}
        <Section title="Expense Categories" delayIndex={2}>
          <div className="bg-[#FAFAFA] border border-[#E2DDD6] rounded-[8px] overflow-hidden">
             {/* Header */}
             <div className="flex items-center px-[16px] py-[10px] border-b border-[#E2DDD6] text-[12px] font-semibold text-[#888] uppercase tracking-wider">
               <div className="w-[28px]"></div>
               <div className="flex-1">Category Name</div>
               <div className="w-[120px] ml-4 text-right pr-4">Monthly Cap</div>
               <div className="w-[60px] text-center">Status</div>
               <div className="w-[32px]"></div>
             </div>

             <Reorder.Group axis="y" values={categories} onReorder={setCategories} className="bg-white">
               {categories.map((cat, i) => (
                 <Reorder.Item key={cat.id} value={cat} className="group relative flex items-center px-[16px] py-[12px] border-b border-[#E2DDD6] last:border-b-0 bg-white hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-[28px] cursor-grab active:cursor-grabbing text-[#C8C3BB] hover:text-[#141414] transition-colors"><GripVertical size={16} /></div>
                    
                    <div className="flex-1 flex items-center gap-3">
                       <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                       <input 
                         value={cat.name} 
                         onChange={e => {
                           const n = [...categories];
                           n[i].name = e.target.value;
                           setCategories(n);
                         }} 
                         className="bg-transparent border-none outline-none text-[15px] font-medium text-near-black w-full focus:ring-1 focus:ring-[#E2DDD6] rounded px-1 transition-all"
                       />
                    </div>
                    
                    <div className="w-[120px] ml-4 flex items-center relative">
                       <span className="absolute left-2 text-[#888] font-mono text-[14px]">₹</span>
                       <input 
                         type="number"
                         value={cat.budget} 
                         onChange={e => {
                           const n = [...categories];
                           n[i].budget = Number(e.target.value);
                           setCategories(n);
                         }} 
                         className="w-full h-[32px] bg-transparent border border-[#E2DDD6] rounded-[6px] outline-none text-[14px] font-mono font-medium text-near-black text-right pr-2 pl-6 focus:border-[#141414] transition-colors"
                       />
                    </div>

                    <div className="w-[60px] flex justify-center ml-2">
                       <Switch.Root 
                         checked={cat.active}
                         onCheckedChange={v => {
                           const n = [...categories];
                           n[i].active = v;
                           setCategories(n);
                         }}
                         className="w-[28px] h-[16px] bg-[#E2DDD6] rounded-full relative data-[state=checked]:bg-[#2D6A4F] outline-none cursor-pointer transition-colors"
                       >
                         <Switch.Thumb className="block w-[12px] h-[12px] bg-white rounded-full shadow-sm transition-transform translate-x-[2px] data-[state=checked]:translate-x-[14px]" />
                       </Switch.Root>
                    </div>

                    <div className="w-[32px] flex justify-end">
                       <button onClick={() => setDeleteConfirms(p => ({ ...p, [cat.id]: true }))} className="p-1.5 text-[#C8C3BB] hover:text-[#9B2335] transition-colors rounded">
                         <Trash2 size={16} />
                       </button>
                    </div>

                    {/* Inline Delete Warning */}
                    <AnimatePresence>
                      {deleteConfirms[cat.id] && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-between px-[16px]"
                        >
                          <p className="text-[14px] text-[#9B2335] font-medium flex items-center gap-2">
                            <AlertTriangle size={14} /> 24 expenses use this. Deactivate instead?
                          </p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setDeleteConfirms(p => ({ ...p, [cat.id]: false }))} className="px-3 py-1.5 text-[13px] font-medium text-[#666] hover:bg-[#EFEFEB] rounded-[6px] transition-colors">Cancel</button>
                            <button onClick={() => {
                               const n = [...categories];
                               n[i].active = false;
                               setCategories(n);
                               setDeleteConfirms(p => ({ ...p, [cat.id]: false }));
                            }} className="px-3 py-1.5 text-[13px] font-medium text-white bg-[#141414] hover:bg-[#2a2a2a] rounded-[6px] transition-colors">Deactivate</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </Reorder.Item>
               ))}
             </Reorder.Group>
          </div>
          <button 
             onClick={() => setCategories([...categories, { id: Date.now().toString(), name: "New Category", budget: 1000, active: true, color: "#9ca3af" }])}
             className="mt-[16px] flex items-center gap-2 text-[#141414] text-[14px] font-semibold hover:bg-[#E2DDD6]/30 px-3 py-1.5 rounded-[6px] transition-colors"
          >
             <Plus size={16} /> Add Category
          </button>
        </Section>

        <Divider />

        {/* SEC 4: FRAUD DETECTION */}
        <Section title="Fraud Detection Settings" delayIndex={3}>
           <div className="pb-[20px] mb-[20px] border-b border-[#E2DDD6]">
              <div className="flex justify-between items-center">
                 <p className="text-[15px] font-medium text-near-black">Enable duplicate detection</p>
                 <Switch.Root 
                   checked={formData.duplicateDetection}
                   onCheckedChange={(v: boolean) => updateForm('duplicateDetection', v)}
                   className="shrink-0 w-[36px] h-[20px] bg-[#E2DDD6] rounded-full relative data-[state=checked]:bg-[#141414] outline-none cursor-pointer transition-colors"
                 >
                   <Switch.Thumb className="block w-[16px] h-[16px] bg-white rounded-full shadow-sm transition-transform translate-x-[2px] data-[state=checked]:translate-x-[18px]" />
                 </Switch.Root>
              </div>
           </div>

           <div className={`transition-opacity duration-300 ${!formData.duplicateDetection ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
             <div className="grid grid-cols-2 gap-[16px] mb-8">
               <Input label="Fuzzy date window" type="number" suffix={<span className="text-[14px]">days</span>} value={formData.fuzzyDateDays} onChange={(e: any) => updateForm('fuzzyDateDays', Number(e.target.value))} />
               <Input label="Fuzzy amount tolerance" type="number" suffix={<span className="text-[14px]">%</span>} value={formData.fuzzyAmountPercent} onChange={(e: any) => updateForm('fuzzyAmountPercent', Number(e.target.value))} />
               <Input label="Velocity limit" type="number" suffix={<span className="text-[14px]">expenses / day</span>} value={formData.velocityLimit} onChange={(e: any) => updateForm('velocityLimit', Number(e.target.value))} />
               <Input label="Auto-block threshold" type="number" suffix={<span className="text-[14px]">/ 100</span>} value={formData.autoBlockThreshold} onChange={(e: any) => updateForm('autoBlockThreshold', Number(e.target.value))} />
             </div>

             <div>
                <label className="block text-[14px] font-medium text-near-black mb-1.5">Score Threshold Zones</label>
                
                {/* Visual Multi-Thumb Mock Slider */}
                <div className="relative w-full h-[32px] mt-6 flex items-center">
                  <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-[8px] rounded-full flex overflow-hidden">
                    <div className="bg-[#10B981]" style={{ width: `${formData.scoreSoftWarn}%` }} />
                    <div className="bg-[#F59E0B]" style={{ width: `${formData.scoreBlock - formData.scoreSoftWarn}%` }} />
                    <div className="bg-[#EF4444]" style={{ width: `${100 - formData.scoreBlock}%` }} />
                  </div>
                  
                  {/* Thumb 1: Soft Warn bound */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-white border border-[#E2DDD6] rounded-full shadow-md z-10 flex flex-col gap-[2px] items-center justify-center cursor-ew-resize" style={{ left: `calc(${formData.scoreSoftWarn}% - 12px)` }}>
                     <div className="w-[1px] h-[8px] bg-[#C8C3BB]" /><div className="w-[1px] h-[8px] bg-[#C8C3BB]" />
                  </div>

                  {/* Thumb 2: Block bound */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-[24px] h-[24px] bg-white border border-[#E2DDD6] rounded-full shadow-md z-10 flex flex-col gap-[2px] items-center justify-center cursor-ew-resize" style={{ left: `calc(${formData.scoreBlock}% - 12px)` }}>
                     <div className="w-[1px] h-[8px] bg-[#C8C3BB]" /><div className="w-[1px] h-[8px] bg-[#C8C3BB]" />
                  </div>
                </div>
                
                <div className="flex justify-between mt-2 relative">
                   <span className="text-[13px] font-medium text-[#10B981]">Allow (0-{formData.scoreSoftWarn-1})</span>
                   <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-[#D97706]">Flag for review ({formData.scoreSoftWarn}-{formData.scoreBlock-1})</span>
                   <span className="text-[13px] font-medium text-[#EF4444]">Auto-block ({formData.scoreBlock}+)</span>
                </div>
             </div>
           </div>
        </Section>

        <Divider />

        {/* SEC 5: NOTIFICATIONS */}
        <Section title="Notification Preferences" delayIndex={4}>
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-[#E2DDD6] text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-semibold w-full">Event</th>
                    <th className="pb-3 px-4 font-semibold text-center whitespace-nowrap">Employee</th>
                    <th className="pb-3 px-4 font-semibold text-center whitespace-nowrap">Manager</th>
                    <th className="pb-3 pl-4 font-semibold text-center whitespace-nowrap">Admin</th>
                 </tr>
              </thead>
              <tbody>
                 {[
                   { id: 'submitted', label: 'Expense submitted' },
                   { id: 'approved', label: 'Expense approved' },
                   { id: 'rejected', label: 'Expense rejected' },
                   { id: 'overdue', label: 'Approval overdue (SLA)' },
                   { id: 'duplicate', label: 'Duplicate flagged' },
                   { id: 'newUser', label: 'New user added' },
                 ].map((row, idx, arr) => (
                   <tr key={row.id} className={`${idx !== arr.length - 1 ? 'border-b border-[#E2DDD6]/60' : ''}`}>
                      <td className="py-4 pr-4 font-medium text-[15px] text-near-black">{row.label}</td>
                      <td className="py-4 px-4 text-center">
                         <input type="checkbox" checked={formData.notifications[row.id as keyof typeof formData.notifications].emp} onChange={() => updateNotif(row.id, 'emp')} className="w-4 h-4 accent-[#141414] cursor-pointer" />
                      </td>
                      <td className="py-4 px-4 text-center">
                         <input type="checkbox" checked={formData.notifications[row.id as keyof typeof formData.notifications].mgr} onChange={() => updateNotif(row.id, 'mgr')} className="w-4 h-4 accent-[#141414] cursor-pointer" />
                      </td>
                      <td className="py-4 pl-4 text-center">
                         <input type="checkbox" checked={formData.notifications[row.id as keyof typeof formData.notifications].adm} onChange={() => updateNotif(row.id, 'adm')} className="w-4 h-4 accent-[#141414] cursor-pointer" />
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </Section>

        {/* SEC 6: DANGER ZONE */}
        <motion.div
           initial={{ opacity: 0, y: 8 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 5 * 0.06, duration: 0.4 }}
           className="mt-[40px] p-[24px] border border-[#FECACA] rounded-[12px] bg-[#FFF8F8]"
        >
           <h2 className="text-[13px] uppercase tracking-[0.07em] text-[#9B2335] mb-[20px] font-bold">Danger Zone</h2>
           
           <div className="flex justify-between items-center py-4 border-b border-[#FECACA]/60 first:pt-0">
             <div>
                <p className="text-[16px] font-medium text-near-black">Export Company Data</p>
                <p className="text-[14px] text-[#888] mt-1">Download all expenses, users and rules as CSV</p>
             </div>
             <button className="whitespace-nowrap px-4 py-2 border border-[#E2DDD6] bg-white text-near-black rounded-[8px] text-[14px] font-medium hover:bg-[#FAFAFA] transition-colors">
                Export CSV
             </button>
           </div>

           <div className="flex justify-between items-center py-4 border-b border-[#FECACA]/60">
             <div>
                <p className="text-[16px] font-medium text-near-black">Reset Approval Rules</p>
                <p className="text-[14px] text-[#888] mt-1">Clears all chains and conditional rules. Cannot be undone.</p>
             </div>
             <button className="whitespace-nowrap px-4 py-2 border border-[#FECACA] bg-white text-[#9B2335] rounded-[8px] text-[14px] font-medium hover:bg-[#FFF0F0] transition-colors">
                Reset Rules
             </button>
           </div>

           <div className="flex justify-between items-center py-4 pb-0">
             <div>
                <p className="text-[16px] font-medium text-near-black">Delete Company Account</p>
                <p className="text-[14px] text-[#888] mt-1">Permanently deletes all data. This cannot be reversed.</p>
             </div>
             <button className="whitespace-nowrap px-4 py-2 border border-transparent bg-[#9B2335] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#7A1D2A] transition-colors">
                Delete Account
             </button>
           </div>
        </motion.div>

      </div>

      {/* FLOATING SAVE BAR */}
      <AnimatePresence>
        {(isDirty || hasSaved) && !isSaving && !hasSaved ? (
          <motion.div
            key="unsaved"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-[24px] left-1/2 -translate-x-1/2 bg-[#141414] rounded-[12px] p-[14px] px-[24px] flex gap-[24px] items-center shadow-2xl z-50 border border-white/10"
          >
             <span className="text-white text-[15px] font-medium whitespace-nowrap">You have unsaved changes</span>
             <div className="flex gap-3">
               <button 
                 onClick={() => { setFormData(initialDataState); setCategories(initialCategories.map(c => ({...c}))); }}
                 className="px-4 py-2 text-white border border-white/20 rounded-[8px] text-[14px] font-medium hover:bg-white/10 transition-colors"
                 disabled={isSaving}
               >
                 Discard
               </button>
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="px-5 py-2 bg-white text-[#141414] rounded-[8px] text-[14px] font-bold hover:bg-[#EFEFEB] transition-all flex items-center gap-2"
               >
                 Save Changes
               </button>
             </div>
          </motion.div>
        ) : isSaving || hasSaved ? (
          <motion.div
            key="saving"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed bottom-[24px] left-1/2 -translate-x-1/2 rounded-[12px] p-[14px] px-[24px] flex gap-[12px] items-center shadow-2xl z-50 border ${hasSaved ? 'bg-[#10B981] border-[#10B981]' : 'bg-[#141414] border-white/10'}`}
          >
             {hasSaved ? (
               <>
                 <Check size={18} className="text-white" strokeWidth={3} />
                 <span className="text-white text-[15px] font-medium whitespace-nowrap pr-2">Saved</span>
               </>
             ) : (
               <>
                 <RefreshCw size={18} className="text-white animate-spin" />
                 <span className="text-white text-[15px] font-medium whitespace-nowrap pr-2">Saving...</span>
               </>
             )}
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
