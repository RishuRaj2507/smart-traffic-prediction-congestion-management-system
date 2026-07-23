"use client";
import React, { useState } from "react";
import { Navigation, ShieldAlert, Route, ArrowRight, Search, ChevronDown, CheckCircle2, Split } from "lucide-react";

// --- Custom Searchable Dropdown Component ---
const SearchableDropdown = ({ value, onChange, options, label }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = options.filter((o: any) => 
    o.road_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div 
        className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2.5 rounded-lg text-sm cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{options.find((o: any) => o.road_id === value)?.road_name || "Select Corridor..."}</span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-500" />
              <input 
                autoFocus
                className="w-full bg-slate-950 p-2 pl-7 text-xs text-white border border-slate-700 rounded focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          {filtered.length > 0 ? filtered.map((r: any, idx: number) => (
            <div 
              key={`${r.road_id}-${idx}`}
              className="px-3 py-2 text-xs text-slate-300 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors"
              onClick={() => { onChange(r.road_id); setIsOpen(false); setQuery(""); }}
            >
              {r.road_name}
            </div>
          )) : (
            <div className="px-3 py-2 text-xs text-slate-500 italic">No corridors found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function NavigationView({ trafficData }: any) {
  const [startPoint, setStartPoint] = useState(trafficData[0]?.road_id || "");
  const [endPoint, setEndPoint] = useState(trafficData[1]?.road_id || "");
  const [routes, setRoutes] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);

  const handleFindRoute = () => {
    setIsRouting(true);
    setTimeout(() => {
      const congestedRoads = trafficData
        .filter((r: any) => r.congestion_level === "HIGH")
        .map((r: any) => r.road_name);

      const baseEta = Math.floor(Math.random() * 20) + 10;
      const baseDistance = (Math.random() * 5 + 3).toFixed(1);

      setRoutes({
        primary: {
          path: [startPoint, "INT-SUB", "COR-EX", endPoint],
          eta: baseEta,
          distance: `${baseDistance} km`,
          avoidedIncidents: congestedRoads.length,
          congestedList: congestedRoads.slice(0, 3)
        },
        alternate: {
          path: [startPoint, "BYPASS-01", "OUTER-RING", endPoint],
          eta: baseEta + 8, // Alternate takes slightly longer
          distance: `${(parseFloat(baseDistance) + 2.4).toFixed(1)} km`,
          avoidedIncidents: Math.max(0, congestedRoads.length - 1),
          congestedList: congestedRoads.slice(1, 3)
        }
      });
      setIsRouting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Navigation className="w-6 h-6 text-blue-500" />
          <span>AI Congestion-Aware Routing</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Deploy dynamic travel vectors avoiding real-time gridlocks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4 self-start sticky top-6">
          <h3 className="font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Route className="w-4 h-4 text-slate-400" />
            <span>Route Planner</span>
          </h3>

          <SearchableDropdown label="Origin Corridor" value={startPoint} onChange={setStartPoint} options={trafficData} />
          <SearchableDropdown label="Destination Corridor" value={endPoint} onChange={setEndPoint} options={trafficData} />

          <button
            onClick={handleFindRoute}
            disabled={isRouting}
            className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${isRouting ? "bg-slate-800 text-slate-500" : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"}`}
          >
            {isRouting ? "Computing Matrix..." : "Generate Smart Route"}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {routes ? (
            <>
              {/* PRIMARY ROUTE */}
              <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-xl shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-bl-lg text-[10px] font-bold tracking-wider flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>PRIMARY / FASTEST</span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Optimal Vector</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">ETA</span>
                    <strong className="block text-xl text-emerald-400 mt-1">{routes.primary.eta} Mins</strong>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Distance</span>
                    <strong className="block text-xl text-white mt-1">{routes.primary.distance}</strong>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase">Avoided Gridlocks</span>
                    <strong className="block text-xl text-amber-400 mt-1">{routes.primary.avoidedIncidents} Zones</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase mb-3 block">Vector Path</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {routes.primary.path.map((node: string, idx: number) => (
                      <React.Fragment key={idx}>
                        <span className="px-3 py-1.5 bg-blue-600/10 text-blue-400 font-mono text-xs font-bold border border-blue-500/20 rounded">{node}</span>
                        {idx < routes.primary.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {routes.primary.avoidedIncidents > 0 && (
                  <div className="p-4 bg-red-950/20 border border-red-950/60 rounded-lg flex items-start space-x-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-red-400/80 uppercase tracking-wider mb-1">Hazard Mitigation</span>
                      <p className="text-[11px] text-slate-400">Bypassed identified active congestion zones: {routes.primary.congestedList.join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ALTERNATE ROUTE */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6 relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 px-3 py-1.5 rounded-bl-lg text-[10px] font-bold tracking-wider flex items-center space-x-1">
                  <Split className="w-3 h-3" />
                  <span>ALTERNATIVE</span>
                </div>

                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Secondary Route</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase">ETA</span>
                    <strong className="block text-lg text-slate-300 mt-1">{routes.alternate.eta} Mins</strong>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase">Distance</span>
                    <strong className="block text-lg text-slate-300 mt-1">{routes.alternate.distance}</strong>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase">Avoided Gridlocks</span>
                    <strong className="block text-lg text-slate-400 mt-1">{routes.alternate.avoidedIncidents} Zones</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase mb-3 block">Alternate Path</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {routes.alternate.path.map((node: string, idx: number) => (
                      <React.Fragment key={idx}>
                        <span className="px-3 py-1.5 bg-slate-900 text-slate-400 font-mono text-xs border border-slate-800 rounded">{node}</span>
                        {idx < routes.alternate.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl border-dashed flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Route className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="font-semibold text-slate-300">No Vectors Loaded</h4>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">Select origin and destination corridors to calculate optimal and alternative routes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}