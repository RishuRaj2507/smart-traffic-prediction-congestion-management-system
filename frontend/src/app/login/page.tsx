"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Activity, AlertCircle, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("operator.traffic@gmail.com");
  const [password, setPassword] = useState("op123");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check specific quick-test accounts first
    if (cleanEmail === "admin.traffic@gmail.com" && password === "admin123") {
      localStorage.setItem("userRole", "ADMIN");
      localStorage.setItem("userName", "Chief Admin Officer");
      localStorage.setItem("userEmail", cleanEmail);
      router.push("/");
    } else if (cleanEmail === "operator.traffic@gmail.com" && password === "op123") {
      localStorage.setItem("userRole", "OPERATOR");
      localStorage.setItem("userName", "Rajesh Kumar (Operator)");
      localStorage.setItem("userEmail", cleanEmail);
      router.push("/");
    } else if (cleanEmail === "commuter.traffic@gmail.com" && password === "user123") {
      localStorage.setItem("userRole", "COMMUTER");
      localStorage.setItem("userName", "Eena Commuter");
      localStorage.setItem("userEmail", cleanEmail);
      router.push("/");
    } 
    // 2. DYNAMIC GMAIL AUTHENTICATION: Allow ANY valid @gmail.com account!
    else if (cleanEmail.endsWith("@gmail.com") && password.length >= 3) {
      // Derive a clean display name from the email prefix (e.g., "rishu@gmail.com" -> "Rishu")
      const namePrefix = cleanEmail.split("@")[0];
      const formattedName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

      // Smart Role Assignment based on keywords in the email
      let assignedRole = "COMMUTER";
      if (cleanEmail.includes("admin")) {
        assignedRole = "ADMIN";
      } else if (cleanEmail.includes("op") || cleanEmail.includes("traffic")) {
        assignedRole = "OPERATOR";
      }

      localStorage.setItem("userRole", assignedRole);
      localStorage.setItem("userName", `${formattedName} (${assignedRole})`);
      localStorage.setItem("userEmail", cleanEmail);
      router.push("/");
    } else {
      setError("Please enter a valid @gmail.com address and a password (at least 3 characters).");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600 rounded-xl mb-3 shadow-lg shadow-blue-500/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TrafficVision AI</h1>
          <p className="text-sm text-slate-400 mt-1">Smart Traffic & Congestion Management</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gmail Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="any.name@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition duration-200 mt-2 shadow-lg shadow-blue-600/30 flex justify-center items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Sign In to Portal</span>
          </button>
        </form>

        {/* 3-Option Quick Test Accounts */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-300 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Quick Select Role (@gmail.com):</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button 
              type="button"
              onClick={() => { setEmail("admin.traffic@gmail.com"); setPassword("admin123"); setError(""); }} 
              className="p-2 bg-slate-950 border border-slate-800 rounded hover:border-purple-500/50 text-left transition"
            >
              <strong className="text-purple-400 block text-xs">Admin</strong>
              <span className="text-[9px] text-slate-500 block truncate">admin.traffic...</span>
              <span className="text-[10px] text-slate-400 font-mono">admin123</span>
            </button>

            <button 
              type="button"
              onClick={() => { setEmail("operator.traffic@gmail.com"); setPassword("op123"); setError(""); }} 
              className="p-2 bg-slate-950 border border-slate-800 rounded hover:border-blue-500/50 text-left transition"
            >
              <strong className="text-blue-400 block text-xs">Operator</strong>
              <span className="text-[9px] text-slate-500 block truncate">operator.traffic...</span>
              <span className="text-[10px] text-slate-400 font-mono">op123</span>
            </button>

            <button 
              type="button"
              onClick={() => { setEmail("commuter.traffic@gmail.com"); setPassword("user123"); setError(""); }} 
              className="p-2 bg-slate-950 border border-slate-800 rounded hover:border-emerald-500/50 text-left transition"
            >
              <strong className="text-emerald-400 block text-xs">Commuter</strong>
              <span className="text-[9px] text-slate-500 block truncate">commuter.traffic...</span>
              <span className="text-[10px] text-slate-400 font-mono">user123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}