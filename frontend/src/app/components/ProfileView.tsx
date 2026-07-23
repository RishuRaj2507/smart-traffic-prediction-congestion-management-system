"use client";
import React from "react";
import { User, Shield, Building2, Mail, Clock, ShieldCheck, Activity } from "lucide-react";

export default function ProfileView({ userName, userEmail, role, department, setIsProfileOpen }: any) {
  
  // Custom permissions description based on the active Role-Based Access Control
  const getRolePermissions = () => {
    if (role === "ADMIN") return ["Full System Calibration", "Sensor Override Access", "Operator Management", "Read/Write Logs"];
    if (role === "OPERATOR") return ["View Ingestion Streams", "Run AI Forecast Engine", "Export System Reports", "Read-Only Configuration"];
    return ["View Live Densities", "Read-Only Route Planning", "Public Feed Access"];
  };

  // Mock activity logs to make the profile feel production-ready
  const mockActivityLogs = [
    { action: "AI Forecast Triggered", target: "HWY-01 Junction", time: "10 mins ago" },
    { action: "System Report Exported", target: "Mumbai Metro CSV", time: "45 mins ago" },
    { action: "User Authentication Success", target: "Secure Token Ingested", time: "2 hours ago" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      
      {/* Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 z-10">
          <div className="w-20 h-20 rounded-2xl bg-blue-700/80 border border-blue-500/50 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            {userName ? userName.charAt(0) : "U"}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">{userName}</h2>
            <p className="text-sm text-slate-400 mt-1.5 flex items-center justify-center md:justify-start space-x-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>{department || "System Operations Division"}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsProfileOpen(true)}
          className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium tracking-wide text-slate-200 transition-all shadow-md z-10"
        >
          Edit Account Settings
        </button>
      </div>

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Account Details Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="font-semibold text-slate-200 mb-5 border-b border-slate-800 pb-4 flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Account Details</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</span>
              <div className="flex items-center space-x-2 text-slate-300 text-sm font-medium">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="truncate">{userEmail}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Group</span>
              <div className="flex items-center space-x-2 text-slate-300 text-sm font-medium">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / RBAC Privilege Panel */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="font-semibold text-slate-200 mb-5 border-b border-slate-800 pb-4 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Security & clearance</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">RBAC System Tier</span>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-lg">
                <ShieldCheck className="w-4 h-4" />
                <span>{role} CLEARANCE</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Granted Tokens</span>
              <div className="flex flex-wrap gap-2">
                {getRolePermissions().map((perm) => (
                  <span key={perm} className="text-[10px] bg-slate-950/80 text-slate-400 border border-slate-800/80 px-2.5 py-1 rounded-md font-medium">
                    • {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Session Ingest Trail */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <h3 className="font-semibold text-slate-200 mb-5 border-b border-slate-800 pb-4 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Recent Activity Logs</span>
          </h3>

          <div className="space-y-3">
            {mockActivityLogs.map((log, index) => (
              <div key={index} className="flex flex-col p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm text-slate-300">{log.action}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{log.time}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{log.target}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}