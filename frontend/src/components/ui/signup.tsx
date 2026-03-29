"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore, UserRole } from "../../store/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Building2 } from "lucide-react";
import Link from "next/link";

export default function SignupIndex() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [role, setRole] = useState<UserRole>("Employee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("United States");
  const [selectedCurrency, setSelectedCurrency] = useState<{ code: string, name: string } | null>(null);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
      .then(res => res.json())
      .then(data => {
        const parsed = data.map((c: any) => ({
          name: c.name.common,
          currencyCode: c.currencies ? Object.keys(c.currencies)[0] : "USD",
          currencyName: c.currencies ? (Object.values(c.currencies)[0] as any)?.name || "US Dollar" : "US Dollar"
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        setCountries(parsed);
        
        const def = parsed.find((p: any) => p.name === "United States");
        if (def) {
           setSelectedCurrency({ code: def.currencyCode, name: def.currencyName });
        }
      })
      .catch(console.error);
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCountry(val);
    const found = countries.find(c => c.name === val);
    if (found) {
       setSelectedCurrency({ code: found.currencyCode, name: found.currencyName });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      login({
        id: `usr_${Date.now()}`,
        name: name || "Test User",
        email: email || "test@example.com",
        role: role,
        companyId: "comp_1"
      }, {
        id: "comp_1",
        name: "Acme Corp",
        country: selectedCountry,
        defaultCurrency: selectedCurrency?.code || "USD"
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
          <h1 className="text-[49px] font-[300] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Expense,<br />Simplified.
          </h1>
          <p className="text-[19px] text-gray-400 leading-relaxed font-sans max-w-md">
            Multi-currency reimbursements<br />with smart approval workflows
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[15px] text-gray-300 backdrop-blur-sm">
            2,400+ companies
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[15px] text-gray-300 backdrop-blur-sm">
            ₹4.2Cr processed
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[15px] text-gray-300 backdrop-blur-sm">
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
            <h2 className="text-[29px] font-medium text-near-black tracking-tight mb-2">Create an account</h2>
            <p className="text-[17px] text-gray-500">Enter your details to sign up.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Pills */}
            <div className="flex p-1 bg-border-light/30 rounded-[10px] w-full gap-1 mb-2">
              {(["Employee", "Manager", "Admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1.5 text-[15px] font-medium rounded-[8px] transition-colors
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
                <label className="block text-[15px] font-medium text-near-black mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-white border border-border-light rounded-[8px] h-[44px] px-[14px] text-[16px] text-near-black outline-none form-input-focus-ring placeholder:text-gray-400 transition-all duration-150"
                  onFocus={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                  onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </div>

              <div>
                <label className="block text-[15px] font-medium text-near-black mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-border-light rounded-[8px] h-[44px] px-[14px] text-[16px] text-near-black outline-none form-input-focus-ring placeholder:text-gray-400 transition-all duration-150"
                  onFocus={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                  onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </div>

              <div>
                <label className="block text-[15px] font-medium text-near-black mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-border-light rounded-[8px] h-[44px] px-[14px] text-[16px] text-near-black outline-none form-input-focus-ring placeholder:text-gray-400 transition-all duration-150"
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
              
              <div className="pt-2">
                <label className="block text-[15px] font-medium text-near-black mb-1.5">Company Country</label>
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full bg-white border border-border-light rounded-[8px] h-[44px] px-[14px] text-[16px] text-near-black outline-none form-input-focus-ring transition-all duration-150 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat pr-10"
                  onFocus={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
                  onBlur={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <option value="" disabled>Select a country</option>
                  {countries.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                {selectedCurrency && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-[#FAFAFA] border border-border-light text-[#666] px-3 py-1.5 rounded-full text-[13px] font-medium">
                    Your company currency will be set to {selectedCurrency.code} — {selectedCurrency.name}
                  </div>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: 0.97 }}
              className="mt-6 w-full bg-near-black text-white rounded-[10px] h-[48px] text-[16px] font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-[15px] text-[#666]">
            Already have an account?{' '}
            <Link href="/login" className="text-near-black font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}