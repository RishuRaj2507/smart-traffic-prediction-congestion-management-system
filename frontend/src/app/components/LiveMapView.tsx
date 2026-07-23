"use client";
import React from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function LiveMapView({ 
  trafficData, 
  selectedState, 
  setSelectedState, 
  selectedCity, 
  setSelectedCity, 
  locationHierarchy 
}: any) {
  
  const regionCoordinates: { [key: string]: [number, number] } = {
    // States
    "Maharashtra": [19.0760, 72.8777], 
    "Delhi NCR": [28.6139, 77.2090],
    "Karnataka": [12.9716, 77.5946],
    "Tamil Nadu": [13.0827, 80.2707],
    "Telangana": [17.3850, 78.4867],
    "West Bengal": [22.5726, 88.3639], 

    // Cities
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.6139, 77.2090],
    "Bengaluru": [12.9716, 77.5946],
    "Chennai": [13.0827, 80.2707],
    "Hyderabad": [17.3850, 78.4867],
    "Kolkata": [22.5726, 88.3639],
    "Pune": [18.5204, 73.8567],
  };

  // Try city first, then state, then default to Mumbai
  const center = regionCoordinates[selectedCity] || regionCoordinates[selectedState] || [19.0760, 72.8777];

  const getColor = (level: string) => {
    if (level === "HIGH") return "#ef4444";
    if (level === "MODERATE") return "#eab308";
    return "#22c55e";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Map Header with State & City Dropdown Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Live GIS Traffic Map</h2>
          <p className="text-xs text-slate-400">Visualizing real-time regional node congestion</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* 1. State Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State:</label>
            <select 
              value={selectedState}
              onChange={(e) => {
                const newState = e.target.value;
                setSelectedState(newState);
                // Automatically update city selection to the first city listed under the new state
                if (locationHierarchy && locationHierarchy[newState]) {
                  const firstCity = locationHierarchy[newState][0];
                  setSelectedCity(firstCity);
                }
              }}
              className="bg-slate-950 border border-slate-700 text-emerald-400 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold shadow-inner"
            >
              {locationHierarchy && Object.keys(locationHierarchy).map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* 2. City Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City:</label>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-blue-400 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold shadow-inner"
            >
              {locationHierarchy && selectedState && locationHierarchy[selectedState]?.map((city: string) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Element */}
      <div className="h-[65vh] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-0">
        <MapContainer key={`${selectedState}-${selectedCity}`} center={center} zoom={12} style={{ height: "100%", width: "100%", background: "#0f172a" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          />
          
          {/* --- FIX ADDED HERE: (road: any, index: number) AND key={`${road.road_id}-${index}`} --- */}
          {trafficData && trafficData.map((road: any, index: number) => {
            const lat = center[0] + (Math.random() - 0.5) * 0.05;
            const lng = center[1] + (Math.random() - 0.5) * 0.05;

            return (
              <CircleMarker
                key={`${road.road_id}-${index}`}
                center={[lat, lng]}
                radius={8}
                pathOptions={{ 
                  fillColor: getColor(road.congestion_level), 
                  color: getColor(road.congestion_level), 
                  fillOpacity: 0.7,
                  weight: 2
                }}
              >
                <Popup className="bg-slate-900 border-slate-800 text-white shadow-xl rounded-lg">
                  <div className="p-1 min-w-[120px]">
                    <strong className="block text-sm mb-1">{road.road_name}</strong>
                    <span className="text-xs text-slate-500 block font-mono">ID: {road.road_id}</span>
                    <span className="text-xs text-slate-300 block mt-1">Speed: {road.speed_kmh} km/h</span>
                    <span className={`mt-2 inline-block px-2.5 py-1 rounded text-[10px] font-bold border ${
                      road.congestion_level === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                      road.congestion_level === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {road.congestion_level}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}