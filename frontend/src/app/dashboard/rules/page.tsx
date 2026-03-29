"use client";

import React, { useState, useEffect } from "react";
import { useRuleStore, ApprovalRule, RuleCondition, ApprovalStep, ConditionField, ConditionOperator } from "../../../store/ruleStore";
import { useAuthStore } from "../../../store/authStore";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { 
  GitMerge, 
  Plus, 
  Settings2, 
  GripVertical, 
  Trash2, 
  Edit3, 
  ArrowRight,
  ShieldAlert,
  Save,
  X,
  CheckCircle2,
  Workflow,
  SplitSquareHorizontal
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";

export default function RulesEnginePage() {
  const { rules, updateRule, deleteRule, addRule } = useRuleStore();
  const { user } = useAuthStore();
  
  const [editingRule, setEditingRule] = useState<ApprovalRule | "NEW" | null>(null);

  // Split into Seq vs Cond
  const [seqRules, setSeqRules] = useState<ApprovalRule[]>([]);
  const [condRules, setCondRules] = useState<ApprovalRule[]>([]);

  useEffect(() => {
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    setSeqRules(sorted.filter(r => r.conditions.length === 0));
    setCondRules(sorted.filter(r => r.conditions.length > 0));
  }, [rules]);

  const handleSeqReorder = (newOrder: ApprovalRule[]) => {
    setSeqRules(newOrder);
    newOrder.forEach((r, idx) => updateRule(r.id, { priority: idx + 1 }));
  };

  const handleCondReorder = (newOrder: ApprovalRule[]) => {
    setCondRules(newOrder);
    newOrder.forEach((r, idx) => updateRule(r.id, { priority: seqRules.length + idx + 1 }));
  };

  if (user?.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-near-black">
        <ShieldAlert size={48} className="text-[#9B2335] mb-4" />
        <h2 className="text-[21px] font-[500] tracking-tight">Access Denied</h2>
        <p className="text-[#888] text-[16px]">Only Administrators can manage the Approval Rules Engine.</p>
      </div>
    );
  }

  const RenderRuleItem = ({ rule }: { rule: ApprovalRule }) => (
    <Reorder.Item 
      value={rule} 
      className={`relative flex items-center p-5 bg-white border rounded-[12px] transition-colors
        ${rule.isActive ? 'border-[#E2DDD6] hover:border-[#a8a39b] shadow-sm' : 'border-[#E2DDD6]/50 bg-[#FAFAFA] opacity-70'}
      `}
    >
      <div className="cursor-grab active:cursor-grabbing p-1 mr-3 text-[#C8C3BB] hover:text-near-black transition-colors">
        <GripVertical size={18} />
      </div>
      
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-medium text-[17px] truncate ${rule.isActive ? "text-near-black" : "text-[#888]"}`}>{rule.name}</h3>
          {!rule.isActive && <span className="text-[12px] uppercase font-bold bg-[#E2DDD6] text-[#666] px-1.5 py-0.5 rounded-sm">Disabled</span>}
        </div>
        <p className="text-[15px] text-[#888] line-clamp-1 mb-3">{rule.description}</p>
        
        <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-mono">
          {rule.conditions.length > 0 ? (
            <>
              {rule.conditions.map((c, i) => (
                <React.Fragment key={c.id}>
                  <span className="bg-[#FEF3C7] text-[#B5660A] px-2 py-0.5 rounded-sm font-medium border border-[#D97706]/20">
                    {c.field} {c.operator} {c.value}
                  </span>
                  {i < rule.conditions.length - 1 && <span className="text-[#C8C3BB] font-sans text-[12px] font-bold">AND</span>}
                </React.Fragment>
              ))}
            </>
          ) : (
            <span className="bg-[#F7F4EF] text-[#666] border border-[#E2DDD6] px-2 py-0.5 rounded-sm">ALL EXPENSES</span>
          )}

          <ArrowRight size={12} className="text-[#C8C3BB] mx-1" />

          {rule.steps.length > 0 ? (
            <>
              {rule.steps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <span className="bg-[#F0FDF4] text-[#2D6A4F] px-2 py-0.5 rounded-sm font-medium border border-[#2D6A4F]/20">
                    {s.role}
                  </span>
                  {i < rule.steps.length - 1 && <ArrowRight size={10} className="text-[#C8C3BB]" />}
                </React.Fragment>
              ))}
            </>
          ) : (
            <span className="bg-[#EFEFEB] px-2 py-0.5 rounded-sm font-medium border border-[#E2DDD6] text-near-black">
              AUTO-APPROVE
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0 border-l border-[#E2DDD6] pl-5">
        <Switch.Root 
          checked={rule.isActive}
          onCheckedChange={(v) => updateRule(rule.id, { isActive: v })}
          className="w-[32px] h-[18px] bg-[#C8C3BB] rounded-full relative data-[state=checked]:bg-[#141414] outline-none cursor-pointer transition-colors"
        >
          <Switch.Thumb className="block w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform translate-x-[2px] data-[state=checked]:translate-x-[16px]" />
        </Switch.Root>

        <div className="flex gap-1">
          <button 
            onClick={() => setEditingRule(rule)}
            className="p-1.5 text-[#888] hover:text-near-black hover:bg-[#EFEFEB] rounded-[4px] transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={() => deleteRule(rule.id)}
            className="p-1.5 text-[#888] hover:text-[#9B2335] hover:bg-[#FFF0F0] rounded-[4px] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );

  return (
    <div className="flex-1 py-[40px] px-[48px] w-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h1 className="text-[29px] font-[400] text-near-black tracking-tight">Routing Rules</h1>
          <p className="text-[16px] text-[#666] mt-1">Configure global sequential routing and conditional overrides.</p>
        </div>
        <button 
          onClick={() => setEditingRule("NEW")}
          className="bg-[#141414] text-white px-5 py-2.5 rounded-[10px] text-[16px] font-medium hover:bg-[#2a2a2a] transition-all flex items-center gap-2 active:scale-97"
        >
          <Plus size={16} /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Panel 1: Sequential Base Rules */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E2DDD6]">
            <Workflow size={18} className="text-[#666]" />
            <h2 className="text-[17px] font-semibold text-near-black uppercase tracking-wider">Sequential Base</h2>
          </div>
          <p className="text-[15px] text-[#888] mb-4">Base routing for all expenses. Order defines execution sequence.</p>
          
          <Reorder.Group axis="y" values={seqRules} onReorder={handleSeqReorder} className="space-y-3">
            {seqRules.map((rule) => <RenderRuleItem key={rule.id} rule={rule} />)}
            {seqRules.length === 0 && (
              <div className="p-8 border border-[#E2DDD6] border-dashed rounded-[12px] text-center text-[#888] text-[15px]">
                No sequential base rules. Expenses will auto-approve if no conditions match.
              </div>
            )}
          </Reorder.Group>
        </div>

        {/* Panel 2: Conditional Overrides */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E2DDD6]">
            <SplitSquareHorizontal size={18} className="text-[#B5660A]" />
            <h2 className="text-[17px] font-semibold text-near-black uppercase tracking-wider">Conditional Overrides</h2>
          </div>
          <p className="text-[15px] text-[#888] mb-4">Exceptions based on thresholds, categories, etc.</p>
          
          <Reorder.Group axis="y" values={condRules} onReorder={handleCondReorder} className="space-y-3">
            {condRules.map((rule) => <RenderRuleItem key={rule.id} rule={rule} />)}
            {condRules.length === 0 && (
              <div className="p-8 border border-[#E2DDD6] border-dashed rounded-[12px] text-center text-[#888] text-[15px]">
                No conditional overrides defined.
              </div>
            )}
          </Reorder.Group>
        </div>

      </div>

      {editingRule && (
        <RuleEditorModal 
          rule={editingRule} 
          onClose={() => setEditingRule(null)} 
          onSave={(r) => {
            if (editingRule === "NEW") {
               addRule({ ...r, id: `rule_${Date.now()}`, priority: rules.length + 1 });
            } else {
               updateRule(r.id, r);
            }
            setEditingRule(null);
          }}
        />
      )}
    </div>
    </div>
  );
}

// -----------------------------------------------------
// Rule Editor Modal Component
// -----------------------------------------------------
function RuleEditorModal({ 
  rule, 
  onClose, 
  onSave 
}: { 
  rule: ApprovalRule | "NEW", 
  onClose: () => void,
  onSave: (rule: ApprovalRule) => void
}) {
  const isNew = rule === "NEW";
  
  const [formData, setFormData] = useState<ApprovalRule>(isNew ? {
    id: "",
    name: "",
    description: "",
    isActive: true,
    priority: 0,
    conditions: [],
    steps: [{ id: `step_${Date.now()}`, role: 'Manager', action: 'Approve' }]
  } : { ...rule });

  const updateField = (field: keyof ApprovalRule, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { id: `cond_${Date.now()}`, field: 'amount', operator: '>=', value: '' }]
    }));
  };

  const updateCondition = (idx: number, updates: Partial<RuleCondition>) => {
    setFormData(prev => {
      const newConds = [...prev.conditions];
      newConds[idx] = { ...newConds[idx], ...updates };
      return { ...prev, conditions: newConds };
    });
  };

  const removeCondition = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== idx)
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { id: `step_${Date.now()}`, role: 'Finance', action: 'Approve' }]
    }));
  };

  const updateStep = (idx: number, updates: Partial<ApprovalStep>) => {
    setFormData(prev => {
      const newSteps = [...prev.steps];
      newSteps[idx] = { ...newSteps[idx], ...updates };
      return { ...prev, steps: newSteps };
    });
  };

  const removeStep = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }));
  };

  return (
    <Dialog.Root open={true} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#EFEFEB]/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[640px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 rounded-[16px] outline-none">
          <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center mb-6 border-b border-[#E2DDD6] pb-4 shrink-0">
              <Dialog.Title className="text-[21px] font-medium flex items-center gap-2 text-near-black">
                <Settings2 size={18} className="text-[#888]" />
                {isNew ? "Create Routing Rule" : "Edit Rule"}
              </Dialog.Title>
              <Dialog.Close className="text-[#888] hover:text-near-black transition-colors rounded-full p-1.5 hover:bg-[#E2DDD6]">
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="overflow-y-auto pr-2 space-y-8 flex-1 pb-4">
              
              <div className="space-y-4">
                <div>
                  <label className="text-[15px] font-semibold text-near-black block mb-1">Rule Name</label>
                  <input required value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Executive Travel Protocol" className="w-full bg-white border border-[#E2DDD6] rounded-[8px] h-[40px] px-[14px] text-[16px] text-near-black outline-none form-input-focus-ring transition-all" />
                </div>
                <div>
                  <label className="text-[15px] font-semibold text-near-black block mb-1">Description</label>
                  <textarea required rows={2} value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="What does this rule do?" className="w-full bg-white border border-[#E2DDD6] rounded-[8px] py-[10px] px-[14px] text-[16px] text-near-black outline-none form-input-focus-ring transition-all resize-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-near-black text-[15px] uppercase tracking-wider">CONDITIONS (IF)</h3>
                  <button type="button" onClick={addCondition} className="text-[14px] text-[#2D6A4F] font-semibold hover:bg-[#F0FDF4] px-2 py-1 rounded transition-colors border border-transparent hover:border-[#2D6A4F]/20">+ Add Statement</button>
                </div>
                
                {formData.conditions.length === 0 ? (
                  <div className="bg-[#FAFAFA] border border-[#E2DDD6] p-4 rounded-[8px] text-[15px] text-[#666] flex items-center gap-2">
                     <CheckCircle2 size={16} className="text-[#888]" /> This rule applies globally to all expenses. (Sequential)
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.conditions.map((cond, i) => (
                      <div key={cond.id} className="flex flex-wrap items-center gap-2 bg-[#FAFAFA] p-3 rounded-[8px] border border-[#E2DDD6]">
                        {i > 0 && <span className="text-[12px] font-bold text-[#888] uppercase w-8 text-center shrink-0">AND</span>}
                        {i === 0 && <span className="w-8 shrink-0"></span>}
                        
                        <select value={cond.field} onChange={e => updateCondition(i, { field: e.target.value as ConditionField })} className="h-[34px] px-2 bg-white border border-[#E2DDD6] rounded outline-none text-[15px]">
                          <option value="amount">Amount</option>
                          <option value="category">Category</option>
                          <option value="department">Department</option>
                        </select>
                        
                        <select value={cond.operator} onChange={e => updateCondition(i, { operator: e.target.value as ConditionOperator })} className="h-[34px] px-2 bg-white border border-[#E2DDD6] rounded outline-none text-[15px]">
                          <option value=">=">&ge;</option>
                          <option value=">">&gt;</option>
                          <option value="<=">&le;</option>
                          <option value="<">&lt;</option>
                          <option value="==">equals</option>
                          <option value="IN">includes</option>
                        </select>

                        <input required type="text" value={cond.value} onChange={e => updateCondition(i, { value: e.target.value })} placeholder="Value" className="h-[34px] px-3 border border-[#E2DDD6] bg-white rounded outline-none text-[15px] min-w-[120px]" />
                        
                        <button type="button" onClick={() => removeCondition(i)} className="ml-auto p-1.5 text-[#888] hover:text-[#9B2335] rounded"><X size={16}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-near-black text-[15px] uppercase tracking-wider">ROUTING SEQUENCE (THEN)</h3>
                  <button type="button" onClick={addStep} className="text-[14px] text-[#141414] font-semibold hover:bg-[#E2DDD6]/50 px-2 py-1 rounded transition-colors">+ Add Step</button>
                </div>

                {formData.steps.length === 0 ? (
                  <div className="bg-[#EFEFEB] border border-[#E2DDD6] text-near-black p-3 rounded-[8px] text-[15px] font-medium flex gap-2 items-center">
                    <CheckCircle2 size={16} /> Auto-approve immediately without routing
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-[17px] before:w-[1px] before:bg-[#E2DDD6]">
                    {formData.steps.map((step, i) => (
                      <div key={step.id} className="flex relative items-center gap-4 pl-12 text-near-black">
                        <div className="absolute left-0 w-[34px] h-[34px] bg-white border border-[#E2DDD6] text-near-black font-medium rounded-full flex items-center justify-center text-[14px] z-10">
                          {i + 1}
                        </div>
                        
                        <div className="flex-1 bg-white p-2.5 rounded-[8px] border border-[#E2DDD6] flex items-center gap-3">
                          <select value={step.role} onChange={e => updateStep(i, { role: e.target.value as any })} className="bg-transparent text-[16px] outline-none flex-1 font-medium text-near-black py-1">
                            <option value="Manager">Direct Manager</option>
                            <option value="Finance">Finance Team</option>
                            <option value="Admin">System Admin</option>
                            <option value="HR">HR Department</option>
                          </select>
                          <span className="text-[#888] text-[14px] italic shrink-0">must</span>
                          <select disabled value={step.action} className="bg-transparent text-[15px] font-semibold text-[#666] outline-none w-24 shrink-0 appearance-none py-1">
                            <option value="Approve">Approve</option>
                            <option value="Notify">Be Notified</option>
                          </select>
                          <button type="button" onClick={() => removeStep(i)} className="p-1.5 text-[#888] hover:text-[#9B2335] rounded ml-auto shrink-0"><X size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-5 mt-auto border-t border-[#E2DDD6] shrink-0">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-[16px] font-medium text-near-black bg-white border border-[#E2DDD6] rounded-[10px] outline-none hover:bg-[#FAFAFA] transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 text-[16px] font-medium text-white bg-[#141414] rounded-[10px] outline-none hover:bg-[#2a2a2a] flex items-center gap-2 transition-colors active:scale-97">
                <Save size={16} /> Save Rule
              </button>
            </div>

          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
