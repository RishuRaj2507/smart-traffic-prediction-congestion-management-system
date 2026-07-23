"use client";
import React from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsView({ trafficData = [], selectedCity }: any) {
  
  // 1. Data Normalization
  const getNormalizedLevel = (level: string) => {
    if (!level) return "LOW";
    const lvl = String(level).toUpperCase();
    if (lvl.includes("HIGH") || lvl.includes("MAJOR") || lvl.includes("CRITICAL")) return "HIGH";
    if (lvl.includes("MODERATE")) return "MODERATE";
    return "LOW";
  };

  const highCount = trafficData.filter((r: any) => getNormalizedLevel(r.congestion_level) === 'HIGH').length;
  const modCount = trafficData.filter((r: any) => getNormalizedLevel(r.congestion_level) === 'MODERATE').length;
  const lowCount = trafficData.filter((r: any) => getNormalizedLevel(r.congestion_level) === 'LOW').length;
  const total = trafficData.length || 0;

  const chartData = [
    { name: "HIGH", value: highCount, color: "#ef4444" },
    { name: "MODERATE", value: modCount, color: "#eab308" },
    { name: "LOW", value: lowCount, color: "#22c55e" },
  ].filter(item => item.value > 0);

  // Synthetic 24h Trend Data
  const hourlyData = Array.from({ length: 8 }, (_, i) => {
    const hour = i * 3;
    const isRushHour = hour === 9 || hour === 18;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      volume: isRushHour ? Math.floor(Math.max(total, 1) * 1.5) : Math.floor(Math.max(total, 1) * 0.6),
      avgSpeed: isRushHour ? 20 : 55
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <h2 className="text-xl font-bold text-white">Traffic Analytics Engine</h2>
        <p className="text-xs text-slate-400">Historical trends and performance for {selectedCity}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl">
          <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider">Network Volume vs. Average Speed</h3>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis yAxisId="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" name="Volume" dataKey="volume" stroke="#3b82f6" strokeWidth={3} />
                <Line yAxisId="right" type="monotone" name="Speed" dataKey="avgSpeed" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col">
          <h3 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Congestion Distribution</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}