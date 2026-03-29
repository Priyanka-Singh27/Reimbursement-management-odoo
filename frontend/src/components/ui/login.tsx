"use client";

import React, { useState } from "react";
import { useAuthStore, UserRole } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Building2 } from "lucide-react";
import Link from "next/link";

export default function LoginIndex() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [role, setRole] = useState<UserRole>("Employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      login({
        id: `usr_${Date.now()}`,
        name: "Test User",
        email: email || "test@example.com",
        role: role,
        companyId: "comp_1"
      }, {
        id: "comp_1",
        name: "Acme Corp",
        country: "USA",
        defaultCurrency: "USD"
      }, "mock-jwt-token");
      
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="flex h-screen w-full bg-shell font-sans overflow-hidden">
      
      {/* Left Panel - 55% */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] bg-near-black text-white p-12 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-near-black">
            <Building2 size={18} />
          </div>
          <span className="font-medium tracking-tight text-white drop-shadow-sm lowercase">reimburse.io</span>
        </div>

        <div className="max-w-xl">
          {/* Force the serif generic for this specific large hero text since user requested "serif-style" */}
          <h1 className="text-[48px] font-[300] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Expense,<br />Simplified.
          </h1>
          <p className="text-[18px] text-gray-400 leading-relaxed font-sans max-w-md">
            Multi-currency reimbursements<br />with smart approval workflows
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[14px] text-gray-300 backdrop-blur-sm">
            2,400+ companies
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[14px] text-gray-300 backdrop-blur-sm">
            ₹4.2Cr processed
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[14px] text-gray-300 backdrop-blur-sm">
            99.8% uptime
          </div>
        </div>
      </div>

      {/* Right Panel - 45% */}
      <div className="flex-1 flex flex-col justify-center items-center bg-cream w-full lg:w-[45%] relative px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-8">
            <h2 className="text-[28px] font-medium text-near-black tracking-tight mb-2">Welcome back</h2>
            <p className="text-[16px] text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Pills */}
            <div className="flex p-1 bg-border-light/30 rounded-[10px] w-full gap-1">
              {(["Employee", "Manager", "Admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1.5 text-[14px] font-medium rounded-[8px] transition-colors
                    ${role === r 
                      ? 'bg-near-black text-white shadow-sm' 
                      : 'bg-transparent text-[#666] hover:text-near-black hover:bg-white/50'
                    }
                  `}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-near-black mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-border-light rounded-[8px] h-[44px] px-[14px] text-[15px] text-near-black outline-none form-input-focus-ring placeholder:text-gray-400 transition-all duration-150"
                  onFocus={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                  onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-[14px] font-medium text-near-black">Password</label>
                  <a href="#" className="text-[13px] text-[#666] hover:text-near-black transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-border-light rounded-[8px] h-[44px] px-[14px] text-[15px] text-near-black outline-none form-input-focus-ring placeholder:text-gray-400 transition-all duration-150"
                    onFocus={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                    onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[50%] -translate-y-[50%] text-gray-400 hover:text-near-black"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-near-black text-white rounded-[10px] h-[48px] text-[15px] font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </motion.button>

          </form>

          <p className="mt-8 text-center text-[14px] text-[#666]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-near-black font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}