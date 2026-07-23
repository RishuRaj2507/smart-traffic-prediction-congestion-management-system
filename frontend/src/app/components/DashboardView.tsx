"use client";
import React from "react";
import { Shield, Car, Activity, AlertTriangle } from "lucide-react";

export default function DashboardView({ role, selectedRoad, setSelectedRoad, forecastTime, setForecastTime, handleForecast, predictionResult }: any) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* RBAC Banner: Admin */}
      {role === "ADMIN" && (
        <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-sm font-semibold text-purple-300">Admin Control Panel Active</h4>
              <p className="text-xs text-purple-400/80">You have privileged access to configure sensor thresholds.</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Total Monitored Nodes</p>
            <h3 className="text-2xl font-bold mt-1">24 Zones</h3>
          </div>
          <Car className="w-10 h-10 text-blue-500/40" />
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Active Congestion Alerts</p>
            <h3 className="text-2xl font-bold mt-1 text-red-400">3 Critical</h3>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500/40" />
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Avg Network Velocity</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">38.5 km/h</h3>
          </div>
          <Activity className="w-10 h-10 text-emerald-500/40" />
        </div>
      </div>

      {/* AI FORECASTING PANEL */}
      {role !== "COMMUTER" && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">🔮 TrafficVision AI Forecasting Engine</h3>
          <p className="text-xs text-slate-400 mb-6">Run predictive analysis on target corridors.</p>
          
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Vector</label>
              <select value={selectedRoad} onChange={(e) => setSelectedRoad(e.target.value)} className="bg-slate-950 border border-slate-800 text-white px-4 py-2 rounded-lg text-sm">
                <option value="HWY-01">HWY-01 (Junction 1)</option>
                <option value="HWY-02">HWY-02 (Junction 2)</option>
              </select>
            </div>
            <button onClick={handleForecast} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition">
              Run ML Prediction
            </button>
          </div>

          {predictionResult && (
            <div className="p-5 bg-slate-950/60 rounded-xl border border-blue-500/20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase">Predicted Density</span>
                <strong className="text-xl block">{predictionResult.predicted_vehicles} units</strong>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase">Forecasted Status</span>
                <span className="block mt-2 text-red-400 font-bold">{predictionResult.forecasted_congestion}</span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                <span className="text-[10px] text-slate-500 uppercase">Flow Velocity</span>
                <strong className="text-xl text-emerald-400 block">{predictionResult.estimated_speed} km/h</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}