"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Car, Activity, AlertTriangle, User, LogOut, Settings, X, Check, Eye, LayoutDashboard, Map, Navigation, BarChart2, FileText, CheckCircle2, Sparkles } from "lucide-react";
import LiveMapView from "./components/LiveMapView";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import NavigationView from "./components/NavigationView";
import RoadManagementView from "./components/RoadManagementView";
import ProfileView from "./components/ProfileView";
import TrafficMonitoringView from "./components/TrafficMonitoringView";
import ForecastingView from "./components/ForecastingView";

interface TrafficMetric {
  road_id: string;
  road_name: string;
  vehicle_count: number;
  speed_kmh: number;
  congestion_level: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("OPERATOR");
  const [userName, setUserName] = useState("Rajesh Kumar (Operator)");
  const [userEmail, setUserEmail] = useState("operator.traffic@gmail.com");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [department, setDepartment] = useState("Urban Mobility & Control");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Default to Dashboard!
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedArea, setSelectedArea] = useState("Bandra Kurla Complex (BKC)");

  // --- Dashboard Pagination State ---
  const [currentDashboardPage, setCurrentDashboardPage] = useState(1);
  const dashboardItemsPerPage = 10;

  // 1. For the Live Map (State -> City)
  const stateHierarchy = {
    "Maharashtra": ["Mumbai", "Pune"],
    "Delhi NCR": ["Delhi"],
    "Karnataka": ["Bengaluru"],
    "Tamil Nadu": ["Chennai"],
    "Telangana": ["Hyderabad"],
    "West Bengal": ["Kolkata"]
  };

  // 2. For the Main Dashboard (City -> Area)
  const locationHierarchy = {
    "Mumbai": ["Bandra Kurla Complex (BKC)", "Andheri East", "Dadar", "Lower Parel", "Navi Mumbai"],
    "Delhi": ["Connaught Place", "Hauz Khas", "Karol Bagh", "Chandni Chowk", "Gurugram Cyber City"],
    "Bengaluru": ["Electronic City", "Whitefield", "Koramangala", "Indiranagar", "Silk Board Junction"],
    "Chennai": ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "OMR IT Expressway"],
    "Hyderabad": ["HITEC City", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Secunderabad"],
    "Kolkata": ["Park Street", "Salt Lake Sector V", "Howrah Bridge", "New Town", "Esplanade"],
    "Pune": ["Hinjewadi IT Park", "Koregaon Park", "Viman Nagar", "Shivajinagar", "Wakad"]
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    if (!storedRole || !storedEmail) {
      router.push("/login");
      return;
    }

    setRole(storedRole);
    if (storedName) setUserName(storedName);
    setUserEmail(storedEmail);
    setIsLoading(false);
  }, [router]);

  const [trafficData, setTrafficData] = useState<TrafficMetric[]>([]);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const url = `http://localhost:8000/api/traffic/live?city=${encodeURIComponent(selectedCity)}&area=${encodeURIComponent(selectedArea)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setTrafficData(data);
        }
      } catch (error) {
        console.error("Failed to fetch live traffic data:", error);
      }
    };

    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 10000);
    return () => clearInterval(interval);
  }, [selectedCity, selectedArea]);

  const getBadgeColor = (level: string) => {
    switch (level) {
      case "HIGH": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "MODERATE": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  // --- Dynamic Metrics for the Cards ---
  const totalZones = trafficData.length;
  const criticalAlerts = trafficData.filter(road => road.congestion_level === 'HIGH').length;
  const avgSpeed = trafficData.length > 0 
    ? (trafficData.reduce((acc, curr) => acc + (Number(curr.speed_kmh) || 0), 0) / trafficData.length).toFixed(1)
    : 0;

  // --- Dashboard Pagination Calculations ---
  const totalDashboardPages = Math.ceil(trafficData.length / dashboardItemsPerPage);
  const indexOfLastDashboardItem = currentDashboardPage * dashboardItemsPerPage;
  const indexOfFirstDashboardItem = indexOfLastDashboardItem - dashboardItemsPerPage;
  const currentDashboardItems = trafficData.slice(indexOfFirstDashboardItem, indexOfLastDashboardItem);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userName", userName);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsProfileOpen(false);
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Activity className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading TrafficVision Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 mr-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TrafficVision AI</h1>
          </div>

          <div className="p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Navigation</p>
            <nav className="space-y-1">
              {[
                { name: "Dashboard", icon: LayoutDashboard },
                { name: "Traffic Monitoring", icon: Activity },
                { name: "Live Map", icon: Map },
                { name: "Road Management", icon: Settings },
                { name: "Navigation", icon: Navigation },
                { name: "Forecasting", icon: Sparkles },
                { name: "Analytics", icon: BarChart2 },
                { name: "Reports", icon: FileText },
                { name: "Profile", icon: User },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.name
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-300">System Status</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">All systems operational. Traffic ingestion active.</p>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-950">
        
        <header className="h-20 flex justify-end items-center px-8 border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
              role === "ADMIN" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : 
              role === "COMMUTER" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
              "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>ROLE: {role}</span>
            </div>

            <button onClick={() => setIsProfileOpen(true)} className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-lg text-sm transition">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                {userName.charAt(0)}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-xs leading-none mb-1">{userName}</span>
                <span className="text-[10px] text-slate-500 leading-none">{userEmail}</span>
              </div>
            </button>

            <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-lg text-slate-400 text-sm font-medium transition">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Switchboard */}
        <div className="p-8">

          {/* ================= TAB: TRAFFIC MONITORING ================= */}
          {activeTab === "Traffic Monitoring" && (
            <TrafficMonitoringView 
              trafficData={trafficData} 
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCity={selectedCity} 
              setSelectedCity={setSelectedCity}
              locationHierarchy={stateHierarchy}
            />
          )}

          {/* ================= TAB 1: DASHBOARD & TRAFFIC ================= */}
          {["Dashboard"].includes(activeTab) && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {role === "ADMIN" && (
                <div className="mb-8 p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300">Admin Control Panel Active</h4>
                      <p className="text-xs text-purple-400/80">You have privileged access to configure sensor thresholds and manage traffic operators.</p>
                    </div>
                  </div>
                  <button type="button" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow transition flex-shrink-0">
                    Manage Operators
                  </button>
                </div>
              )}

              {role === "COMMUTER" && (
                <div className="mb-8 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-300">Public Commuter Live Feed</h4>
                      <p className="text-xs text-emerald-400/80">You are viewing real-time road utilization and congestion statuses to plan your commute.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                    Read-Only Access
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Monitored Nodes</p>
                    <h3 className="text-2xl font-bold mt-1">{totalZones} Zones</h3>
                  </div>
                  <Car className="w-10 h-10 text-blue-500/40" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Active Congestion Alerts</p>
                    <h3 className="text-2xl font-bold mt-1 text-red-400">{criticalAlerts} Critical</h3>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-500/40" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Avg Network Velocity</p>
                    <h3 className="text-2xl font-bold mt-1 text-emerald-400">{avgSpeed} km/h</h3>
                  </div>
                  <Activity className="w-10 h-10 text-emerald-500/40" />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Monitor City Sector</label>
                  <select 
                    value={selectedCity}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setSelectedCity(newCity);
                      setSelectedArea(locationHierarchy[newCity as keyof typeof locationHierarchy][0]);
                      setCurrentDashboardPage(1); // Reset page on filter change
                    }}
                    className="bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {Object.keys(locationHierarchy).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Specific Zone / Area</label>
                  <select 
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setCurrentDashboardPage(1); // Reset page on filter change
                    }}
                    className="bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {locationHierarchy[selectedCity as keyof typeof locationHierarchy].map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="font-semibold text-lg">Live Road Utilization & Vehicle Density</h2>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 animate-pulse">● Live Ingestion</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-sm bg-slate-950/50">
                        <th className="p-4">Road Identifier</th>
                        <th className="p-4">Location Name</th>
                        <th className="p-4">Vehicle Count</th>
                        <th className="p-4">Avg Speed</th>
                        <th className="p-4">Congestion Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {currentDashboardItems.map((road, index) => (
                        <tr key={`${road.road_id}-${index}`} className="hover:bg-slate-800/50 transition">
                          <td className="p-4 font-mono font-medium text-slate-300">{road.road_id}</td>
                          <td className="p-4 font-medium">{road.road_name}</td>
                          <td className="p-4">{road.vehicle_count} units</td>
                          <td className="p-4">{road.speed_kmh} km/h</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(road.congestion_level)}`}>
                              {road.congestion_level}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* --- Dashboard Table Pagination Controls --- */}
                <div className="flex justify-between items-center p-4 border-t border-slate-800 bg-slate-900/50">
                  <button
                    onClick={() => setCurrentDashboardPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentDashboardPage === 1}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm font-medium text-slate-400">
                    Page <span className="text-white">{currentDashboardPage}</span> of <span className="text-white">{totalDashboardPages || 1}</span>
                  </span>
                  
                  <button
                    onClick={() => setCurrentDashboardPage(prev => Math.min(prev + 1, totalDashboardPages))}
                    disabled={currentDashboardPage === totalDashboardPages || totalDashboardPages === 0}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: FORECASTING ================= */}
          {activeTab === "Forecasting" && (
            <ForecastingView trafficData={trafficData} />
          )}

          {/* ================= TAB 2: LIVE MAP ================= */}
          {activeTab === "Live Map" && (
            <LiveMapView 
              trafficData={trafficData}
              selectedState={selectedState}
              setSelectedState={setSelectedState} 
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              locationHierarchy={stateHierarchy} 
            />
          )}
          {/* ================= TAB 3: ANALYTICS ================= */}
          {activeTab === "Analytics" && (
            <AnalyticsView
              trafficData={trafficData} 
              selectedCity={selectedCity}
            />
          )}
          {/* ================= TAB 4: REPORTS ================= */}
          {activeTab === "Reports" && (
            <ReportsView 
              trafficData={trafficData} 
              selectedCity={selectedCity} 
              setSelectedCity={setSelectedCity}
              selectedArea={selectedArea}
              setSelectedArea={setSelectedArea}
              locationHierarchy={locationHierarchy}
            />
          )}
          {/* ================= TAB 5: NAVIGATION ================= */}
          {activeTab === "Navigation" && (
            <NavigationView trafficData={trafficData} />
          )}
          {/* ================= TAB 6: ROAD MANAGEMENT ================= */}
          {activeTab === "Road Management" && (
            <RoadManagementView role={role} trafficData={trafficData} />
            )}

          {/* ================= TAB 7: USER PROFILE ================= */}
          {activeTab === "Profile" && (
            <ProfileView 
              userName={userName}
              userEmail={userEmail}
              role={role}
              department={department}
              setIsProfileOpen={setIsProfileOpen}
            />
          )}

        </div>
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button type="button" onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Profile Management</h3>
                <p className="text-xs text-slate-400">Update your account settings and department details.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Gmail Address (Read Only)</label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800/60 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department / Zone</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned Role</label>
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-semibold text-blue-400 flex items-center justify-between">
                  <span>{role}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">RBAC Secured</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-sm font-medium hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition flex items-center space-x-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}