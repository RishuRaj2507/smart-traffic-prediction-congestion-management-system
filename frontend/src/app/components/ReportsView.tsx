"use client";
import React, { useState } from "react";
import { FileText, Download, Calendar, Filter, FileSpreadsheet, Search, ChevronDown } from "lucide-react";

// --- Reusable Searchable Dropdown ---
const SearchableDropdown = ({ value, onChange, options, label }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = options.filter((o: any) => o.road_name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div 
        className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2.5 rounded-lg text-sm cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find((o: any) => o.road_id === value)?.road_name || "Select Road..."}</span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-500" />
              <input autoFocus className="w-full bg-slate-950 p-2 pl-7 text-xs text-white border border-slate-700 rounded focus:outline-none" placeholder="Search..." onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          {filtered.map((r: any, idx: number) => (
            <div key={`${r.road_id}-${idx}`} className="px-3 py-2 text-xs text-slate-300 hover:bg-blue-600 cursor-pointer" onClick={() => { onChange(r.road_id); setIsOpen(false); }}>
              {r.road_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ReportsView({ trafficData, selectedCity, setSelectedCity, selectedArea, setSelectedArea, locationHierarchy }: any) {
  const [selectedRoad, setSelectedRoad] = useState("ALL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [logs, setLogs] = useState([
    { id: 1, name: "System_Auto_Log_01.csv", time: "08:00 AM" },
  ]);

  const downloadCSV = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const dataToExport = selectedRoad === "ALL" 
        ? trafficData 
        : trafficData.filter((r: any) => r.road_id === selectedRoad);

      const headers = ["Road ID", "Road Name", "Vehicle Count", "Speed (km/h)", "Congestion Level"];
      const csvString = [headers.join(","), ...dataToExport.map((r: any) => [r.road_id, `"${r.road_name}"`, r.vehicle_count, r.speed_kmh, r.congestion_level].join(","))].join("\n");

      const blob = new Blob([csvString], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const filename = `Traffic_Export_${selectedCity}_${new Date().toISOString().split('T')[0]}.csv`;
      link.download = filename;
      link.click();

      setLogs(prev => [{ id: Date.now(), name: filename, time: new Date().toLocaleTimeString() }, ...prev]);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2"><FileText className="w-6 h-6 text-blue-500" /><span>Automated Data Reports</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
          <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-2">Generate Custom Export</h3>
          <div className="flex gap-3">
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-lg text-sm">{locationHierarchy && Object.keys(locationHierarchy).map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 p-2.5 rounded-lg text-sm">{locationHierarchy && selectedCity && locationHierarchy[selectedCity as keyof typeof locationHierarchy]?.map((a: string) => <option key={a} value={a}>{a}</option>)}</select>
          </div>
          <SearchableDropdown label="Specific Road Corridor" value={selectedRoad} onChange={setSelectedRoad} options={[{road_id: "ALL", road_name: "All Roads"}, ...trafficData]} />
          <button onClick={downloadCSV} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg">{isGenerating ? "Compiling..." : "Download .CSV Export"}</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
            <h3 className="font-semibold text-slate-200">System Export Log</h3>
            <div className="relative">
              <input type="text" placeholder="Filter logs..." className="bg-slate-950 border border-slate-700 text-xs text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 w-32" onChange={(e) => setFilterQuery(e.target.value)} />
              <Filter className="w-3 h-3 absolute right-2 top-2 text-slate-500" />
            </div>
          </div>
          <div className="space-y-3">
            {logs.filter(l => l.name.toLowerCase().includes(filterQuery.toLowerCase())).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-3"><FileSpreadsheet className="w-5 h-5 text-emerald-500" /><div><p className="text-xs font-semibold text-slate-300">{log.name}</p><p className="text-[10px] text-slate-500">Generated at {log.time}</p></div></div>
                <Download className="w-4 h-4 text-slate-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}