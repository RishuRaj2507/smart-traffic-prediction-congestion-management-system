"use client";
import React, { useState } from "react";
import { Settings, Sliders, Save, AlertCircle, Server, Radio } from "lucide-react";

export default function RoadManagementView({ role, trafficData = [] }: any) {
  const [criticalThreshold, setCriticalThreshold] = useState(20);
  const [isSaving, setIsSaving] = useState(false);
  const [overrideActive, setOverrideActive] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  // Dynamically generate hardware diagnostics from your real dataset
  const dynamicSensors = trafficData.map((road: any, index: number) => {
    // Generate distinct types and realistic latencies for the IoT array based on the index
    const isRadar = index % 3 === 0;
    const isOffline = index === 2 || (index > 0 && index % 15 === 0); // Mock a couple of offline nodes out of the 100 entries

    return {
      id: isRadar ? `RAD-${road.road_id.split("-")[1] || index}` : `CAM-${road.road_id.split("-")[1] || index}`,
      loc: road.road_name,
      type: isRadar ? "Radar Velocity" : "Computer Vision",
      ping: isOffline ? "-" : `${Math.floor(Math.random() * 15) + 5}ms`,
      status: isOffline ? "Offline" : "Active"
    };
  });

  // --- Pagination Calculations ---
  const totalPages = Math.ceil(dynamicSensors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // This is the slice of 10 items we will actually render on the screen
  const currentSensors = dynamicSensors.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-500" />
            <span>Road Network Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage AI thresholds, hardware sensors, and system overrides.</p>
        </div>
      </div>

      {/* RBAC Warning Banner */}
      {role !== "ADMIN" && (
        <div className="p-4 bg-yellow-950/30 border border-yellow-500/30 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-500">Restricted Access (Operator Level)</h4>
            <p className="text-xs text-yellow-500/70 mt-1">
              You are viewing the control panel in read-only mode. Only users with the ADMIN role can commit changes to global network thresholds or trigger emergency overrides.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: AI Calibration */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6">
          <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>AI Congestion Thresholds</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Critical "HIGH" Trigger (Speed &lt; x km/h)</label>
                <span className="text-sm font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{criticalThreshold} km/h</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="35" 
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                disabled={role !== "ADMIN"}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${role === "ADMIN" ? "bg-slate-700 accent-blue-500" : "bg-slate-800 accent-slate-600 cursor-not-allowed"}`}
              />
              <p className="text-[10px] text-slate-500 mt-2">If average speed drops below this limit, the AI will classify the node as HIGH congestion and trigger re-routing protocols.</p>
            </div>
            
            <button 
              onClick={handleSaveConfig}
              disabled={role !== "ADMIN" || isSaving}
              className={`w-full mt-4 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                role !== "ADMIN" 
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                  : isSaving ? "bg-blue-800 text-blue-300" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
              }`}
            >
              {isSaving ? <span className="animate-pulse">Pushing to Server...</span> : <><Save className="w-4 h-4" /> <span>Commit Configuration</span></>}
            </button>
          </div>
        </div>

        {/* Panel 2: Emergency Overrides */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6">
          <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-slate-400" />
            <span>Emergency Manual Overrides</span>
          </h3>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Global Green-Wave Protocol</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Forces all traffic signals on arterial roads to green for emergency vehicle clearance.</p>
            </div>
            
            <button 
              onClick={() => setOverrideActive(!overrideActive)}
              disabled={role !== "ADMIN"}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                role !== "ADMIN" ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700" :
                overrideActive ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20" : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {overrideActive ? "PROTOCOL ACTIVE" : "ENGAGE PROTOCOL"}
            </button>
          </div>
        </div>

        {/* Panel 3: Hardware Diagnostics (Dynamic IoT List) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
              <Server className="w-4 h-4 text-slate-400" />
              <span>IoT Camera & Sensor Diagnostics ({dynamicSensors.length} Devices Linked)</span>
            </h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-ping"></span> Live Ingestion
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-4">Hardware ID</th>
                  <th className="p-4">Location Sector</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Ping</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentSensors.length > 0 ? (
                  currentSensors.map((sensor: any, index: number) => (
                    <tr key={`${sensor.id}-${index}`} className="hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono text-slate-300">{sensor.id}</td>
                      <td className="p-4 font-medium">{sensor.loc}</td>
                      <td className="p-4 text-slate-400">{sensor.type}</td>
                      <td className="p-4 font-mono">{sensor.ping}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sensor.status === 'Active' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {sensor.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No active IoT streams detected. Verify backend ingestion.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination Controls --- */}
          <div className="flex justify-between items-center p-4 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
            >
              Previous
            </button>
            
            <span className="text-sm font-medium text-slate-400">
              Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages || 1}</span>
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}