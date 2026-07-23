"use client";
import React, { useState } from "react";
import { Filter, Activity, Search } from "lucide-react";

export default function TrafficMonitoringView({ trafficData, selectedState, setSelectedState, selectedCity, setSelectedCity, locationHierarchy }: any) {
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, HIGH, MODERATE, LOW
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logic: Filter by congestion status
  const filteredData = trafficData.filter((road: any) => {
    if (filterStatus === "ALL") return true;
    return road.congestion_level === filterStatus;
  });

  // --- Pagination Calculations ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // This is the slice of 10 items we will actually render on the screen
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header and Smart Filters */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <span>Traffic Monitoring Terminal</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* State/City Selectors */}
          <div className="flex gap-2">
            <select 
              value={selectedState} 
              onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }} 
              className="bg-slate-950 border border-slate-800 text-sm px-3 py-2 rounded-lg w-full"
            >
              {Object.keys(locationHierarchy).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={selectedCity} 
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }} 
              className="bg-slate-950 border border-slate-800 text-sm px-3 py-2 rounded-lg w-full"
            >
              {locationHierarchy[selectedState as keyof typeof locationHierarchy]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Congestion Filter Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 col-span-2">
            {["ALL", "HIGH", "MODERATE", "LOW"].map((status) => (
              <button 
                key={status}
                onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${filterStatus === status ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                {status} TRAFFIC
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-950/50">
              <th className="p-4">Road Identifier</th>
              <th className="p-4">Location Name</th>
              <th className="p-4">Vehicle Count</th>
              <th className="p-4">Avg Speed</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
          {currentItems.length > 0 ? currentItems.map((road: any, index: number) => (
            <tr key={`${road.road_id}-${index}`} className="hover:bg-slate-800/30 transition">
                <td className="p-4 font-mono text-slate-300">{road.road_id}</td>
                <td className="p-4 font-medium">{road.road_name}</td>
                <td className="p-4">{road.vehicle_count} units</td>
                <td className="p-4">{road.speed_kmh} km/h</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${road.congestion_level === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : road.congestion_level === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {road.congestion_level}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500">No nodes matching this filter criteria.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
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
  );
}