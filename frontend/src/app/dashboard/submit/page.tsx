"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, X, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import { useExpenseStore, FraudSignal } from "../../../store/expenseStore";
import { FraudWarningBanner } from "../../../components/fraud/FraudWarningBanner";
import Link from "next/link";
import axios from "axios";

const CATEGORIES = ["Travel", "Food", "Supplies", "Entertainment", "Other"];
const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "SGD", symbol: "S$" },
  { code: "AUD", symbol: "A$" }
];

export default function SubmitExpensePage() {
  const { user, company } = useAuthStore();
  const { addExpense, evaluateFraud } = useExpenseStore();
  const router = useRouter();

  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>(company?.defaultCurrency || "USD");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [isFxLoading, setIsFxLoading] = useState(false);
  const [fxError, setFxError] = useState<string | null>(null);

  const [fraudEval, setFraudEval] = useState<{ score: number, signals: FraudSignal[] }>({ score: 0, signals: [] });
  const [fraudDismissed, setFraudDismissed] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setReceiptUrl(previewUrl);
      simulateOcrEngine(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"]
    },
    maxFiles: 1
  });

  const simulateOcrEngine = (file: File) => {
    setIsOcrLoading(true);
    setValidationError(null);
    const delay = Math.floor(Math.random() * (800 - 300 + 1) + 300);

    setTimeout(() => {
      const mockExtracted = {
        amount: "145.50",
        date: new Date().toISOString().split("T")[0],
        description: "Uber ride to terminal and Coffee",
        category: "Travel"
      };

      const fieldsFilled = new Set<string>();
      if (Math.random() > 0.1) { setAmount(mockExtracted.amount); fieldsFilled.add("amount"); }
      if (Math.random() > 0.1) { setDate(mockExtracted.date); fieldsFilled.add("date"); }
      if (Math.random() > 0.2) { setDescription(mockExtracted.description); fieldsFilled.add("description"); }
      if (Math.random() > 0.3) { setCategory(mockExtracted.category); fieldsFilled.add("category"); }

      setAutoFilledFields(fieldsFilled);
      setIsOcrLoading(false);
    }, delay);
  };

  useEffect(() => {
    const fetchFx = async () => {
      if (!amount || isNaN(Number(amount))) {
        setConvertedAmount(null);
        return;
      }
      if (currency === company?.defaultCurrency) {
        setConvertedAmount(Number(amount));
        setFxRate(1);
        setFxError(null);
        return;
      }
      setIsFxLoading(true);
      setFxError(null);
      try {
        const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const rate = res.data.rates[company?.defaultCurrency || "USD"];
        if (rate) {
          setFxRate(rate);
          setConvertedAmount(Number(amount) * rate);
        } else {
          setFxError("Conversion unavailable");
        }
      } catch (err) {
        setFxError("API fetch failed");
      } finally {
        setIsFxLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchFx, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, currency, company?.defaultCurrency]);

  useEffect(() => {
    if (user && (amount || date || description || category)) {
      const ev = evaluateFraud({
        amount: Number(amount) || 0,
        date: date || undefined,
        description: description || "",
        category: category || "",
        currency
      }, user.id);
      
      setFraudEval(ev);
    } else {
      setFraudEval({ score: 0, signals: [] });
    }
  }, [amount, date, description, category, currency, evaluateFraud, user]);

  const removeReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReceiptUrl(null);
    setAutoFilledFields(new Set());
  };

  const clearAutoFilledBadge = (field: string) => {
    if (autoFilledFields.has(field)) {
      const newSet = new Set(autoFilledFields);
      newSet.delete(field);
      setAutoFilledFields(newSet);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptUrl) {
      setValidationError("Please upload a receipt image or PDF.");
      return;
    }
    if (!amount || !category || !description || !date) {
      setValidationError("Please fill out all required fields.");
      return;
    }
    
    if (fraudEval.score >= 85) {
      setValidationError("Submission blocked: High confidence duplicate detected.");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      addExpense({
        id: `exp_${Date.now()}`,
        userId: user!.id,
        amount: Number(amount),
        currency,
        convertedAmount: convertedAmount || Number(amount),
        companyCurrency: company?.defaultCurrency || "USD",
        category,
        description,
        date,
        receiptUrl,
        status: fraudEval.score >= 50 ? "Pending" : "Pending", // Technically in a real app, score >= 50 would add a flag to the DB payload
        fraudScore: fraudEval.score,
        fraudSignals: fraudEval.signals,
        timeline: [
          {
            id: `evt_${Date.now()}`,
            approverId: user!.id,
            approverName: user!.name,
            action: 'Commented' as const,
            comment: "Submitted expense",
            timestamp: new Date().toISOString()
          }
        ]
      });
      router.push("/dashboard/my-expenses");
    } catch (err) {
      setValidationError("System Error uploading expense. Try again.");
      setIsSubmitting(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const companyCurrencySymbol = getCurrencySymbol(company?.defaultCurrency || "USD");

  const FieldLabel = ({ label, fieldId }: { label: string, fieldId: string }) => (
    <div className="flex justify-between items-end mb-1.5">
      <label htmlFor={fieldId} className="block text-[14px] font-medium text-near-black">
        {label} <span className="text-red-500">*</span>
      </label>
      {autoFilledFields.has(fieldId) && (
        <span className="text-[11px] uppercase font-bold tracking-wider bg-[#EDD9A3]/30 text-[#B5660A] py-0.5 px-2 rounded-full flex items-center gap-1">
          <CheckCircle2 size={10} /> AUTO-FILLED
        </span>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-[400] text-near-black tracking-tight">Submit Expense</h1>
          <p className="text-[15px] text-gray-500 mt-1">Upload your receipt and verify details for reimbursement.</p>
        </div>
      </div>

      {validationError && (
        <div className="bg-[#FFF0F0] text-[#9B2335] p-4 rounded-[8px] flex items-start gap-3 border border-red-100">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="font-medium text-[15px]">{validationError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Receipt Upload & OCR Status */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-near-black uppercase tracking-wider mb-2 flex items-center gap-2">
            <Receipt size={16} /> RECEIPT IMAGE
          </h2>
          
          <div 
            {...getRootProps()} 
            className={`border-2 rounded-[12px] p-2 relative flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[350px]
              ${isDragActive ? "border-[#141414] bg-white/50" : "border-dashed border-[#C8C3BB] hover:border-[#a8a39b] bg-white/20"}
              ${receiptUrl ? "border-solid border-[#E2DDD6] bg-white" : ""}
              ${isOcrLoading ? "animate-pulse-border border-solid" : ""}
            `}
          >
            <input {...getInputProps()} />
            
            <AnimatePresence mode="wait">
              {isOcrLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center flex-1 justify-center space-y-3 p-10"
                >
                  <div className="text-near-black animate-spin">
                    <RefreshCw size={28} />
                  </div>
                  <p className="text-[14px] font-medium text-near-black tracking-wide">Scanning receipt data...</p>
                </motion.div>
              ) : receiptUrl ? (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="w-full relative rounded-[8px] overflow-hidden group h-full min-h-[330px] flex items-center justify-center bg-[#f0f0f0]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptUrl} alt="Receipt preview" className="max-w-full max-h-[330px] object-contain rounded-[8px]" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white text-near-black px-4 py-2 rounded-[6px] font-medium shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all text-[14px]">
                      Replace Document
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={removeReceipt}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-near-black hover:bg-[#E2DDD6] shadow-sm transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-3 py-10"
                >
                  <div className="text-[#a8a39b] mb-2">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-near-black">Upload a receipt or invoice</p>
                    <p className="text-[13px] text-[#888] mt-1">Accepts images and PDFs</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <p className="text-[13px] text-[#888] leading-relaxed">
            Data is auto-extracted using OCR. Always verify fields before submitting.
          </p>
        </div>

        {/* Right Side: Expense Form */}
        <div className="lg:col-span-7">
          <div className="space-y-6">
            
            <h2 className="text-[15px] font-semibold text-near-black uppercase tracking-wider mb-2">
              DETAILS
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <FieldLabel label="Amount" fieldId="amount" />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666] font-mono font-medium">
                    {getCurrencySymbol(currency)}
                  </div>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      clearAutoFilledBadge("amount");
                    }}
                    placeholder="0.00"
                    className={`w-full bg-white border rounded-[8px] h-[44px] pl-8 pr-[14px] text-[16px] font-mono text-near-black outline-none form-input-focus-ring placeholder:text-[#a8a39b] transition-all duration-150 ${autoFilledFields.has("amount") ? "border-[#EDD9A3] bg-[#FEF3C7]/30" : "border-[#E2DDD6]"}`}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-[14px] font-medium text-near-black mb-1.5">Currency</label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-[#E2DDD6] rounded-[8px] h-[44px] px-[14px] text-[15px] text-near-black outline-none form-input-focus-ring transition-all duration-150 uppercase"
                >
                  {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <AnimatePresence>
              {currency !== company?.defaultCurrency && amount && !isNaN(Number(amount)) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-[14px] overflow-hidden"
                >
                  <RefreshCw size={14} className={`text-[#888] ${isFxLoading ? "animate-spin" : ""}`} />
                  {fxError ? (
                    <span className="text-[#B5660A] font-medium">{fxError}. Enter exact amount manually.</span>
                  ) : convertedAmount !== null ? (
                    <span className="text-[#666]">
                      <strong className="text-near-black font-semibold font-mono">{companyCurrencySymbol}{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> 
                      <span className="ml-1">(1 {currency} = {companyCurrencySymbol}{fxRate?.toFixed(2)})</span>
                    </span>
                  ) : (
                    <span className="text-[#888]">Fetching rates...</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Date" fieldId="date" />
                <input
                  type="date"
                  id="date"
                  value={date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDate(e.target.value);
                    clearAutoFilledBadge("date");
                  }}
                  className={`w-full bg-white border rounded-[8px] h-[44px] px-[14px] text-[15px] text-near-black outline-none form-input-focus-ring transition-all duration-150 ${autoFilledFields.has("date") ? "border-[#EDD9A3] bg-[#FEF3C7]/30" : "border-[#E2DDD6]"}`}
                />
              </div>

              <div>
                <FieldLabel label="Category" fieldId="category" />
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    clearAutoFilledBadge("category");
                  }}
                  className={`w-full bg-white border rounded-[8px] h-[44px] px-[14px] text-[15px] outline-none form-input-focus-ring transition-all duration-150 ${!category ? "text-[#a8a39b]" : "text-near-black"} ${autoFilledFields.has("category") ? "border-[#EDD9A3] bg-[#FEF3C7]/30 text-near-black" : "border-[#E2DDD6]"}`}
                >
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <FieldLabel label="Description" fieldId="description" />
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearAutoFilledBadge("description");
                }}
                placeholder="e.g. Client dinner with Acme Corp"
                className={`w-full bg-white border rounded-[8px] pt-[12px] px-[14px] text-[15px] placeholder:text-[#a8a39b] text-near-black outline-none form-input-focus-ring resize-none transition-all duration-150 ${autoFilledFields.has("description") ? "border-[#EDD9A3] bg-[#FEF3C7]/30" : "border-[#E2DDD6]"}`}
              />
            </div>
            
            <FraudWarningBanner 
              score={fraudEval.score} 
              reason={fraudEval.signals[0]?.reason} 
              isVisible={fraudEval.score >= 50 && !fraudDismissed} 
              onDismiss={() => setFraudDismissed(true)} 
            />

            <div className="flex justify-end pt-4 mt-6 border-t border-[#E2DDD6]">
              <button
                type="submit"
                disabled={isSubmitting || isOcrLoading || isFxLoading || (fraudEval.score >= 85)}
                className={`px-8 py-2.5 text-[15px] font-medium text-white bg-[#141414] rounded-[10px] hover:bg-[#2a2a2a] transition-all flex items-center gap-2 active:scale-97
                  ${(isSubmitting || isOcrLoading || isFxLoading || fraudEval.score >= 85) ? "opacity-70 cursor-not-allowed" : ""}
                `}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Processing...
                  </>
                ) : "Submit Setup"}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
