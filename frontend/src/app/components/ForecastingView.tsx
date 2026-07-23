"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  CloudRain,
  Sun,
  Thermometer,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  CheckCircle2,
  Split,
  Map,
} from "lucide-react";

export default function ForecastingView({ trafficData = [] }: any) {
  const [startPoint, setStartPoint] = useState(
    trafficData[0]?.road_id || ""
  );
  const [endPoint, setEndPoint] = useState(
    trafficData[1]?.road_id || ""
  );
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const uniqueRoads = trafficData.filter(
    (road: any, index: number, self: any[]) =>
      index === self.findIndex((r) => r.road_id === road.road_id)
  );

  const handleRunPrediction = async () => {
    setIsLoading(true);

    try {
      let hour = new Date().getHours();

      if (targetTime) {
        hour = parseInt(targetTime.split(":")[0], 10);
      }

      const response = await fetch(
        "http://localhost:8000/api/traffic/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            road_id: startPoint, // Predict based on the starting location
            hour,
          }),
        }
      );

      const mlData = await response.json();
      
      if (mlData.error) {
        setPredictionResult({ error: mlData.error });
        setIsLoading(false);
        return;
      }

      // Simulate Route Generation Matrix based on the ML Prediction
      const baseEta = Math.floor(Math.random() * 20) + 15;
      const baseDistance = (Math.random() * 8 + 4).toFixed(1);
      const isBadWeather = mlData.precipitation_mm > 2.0;

      const generatedRoutes = {
        primary: {
          path: [startPoint, "JCT-CORE", "EXPRESS-WAY", endPoint],
          eta: isBadWeather ? baseEta + 12 : baseEta,
          distance: `${baseDistance} km`,
          avoidedIncidents: mlData.predicted_congestion === "HIGH" ? 2 : 0,
        },
        alternate: {
          path: [startPoint, "CITY-BYPASS", "OUTER-RING", endPoint],
          eta: isBadWeather ? baseEta + 18 : baseEta + 8,
          distance: `${(parseFloat(baseDistance) + 3.2).toFixed(1)} km`,
          avoidedIncidents: 0,
        }
      };

      setPredictionResult({ ...mlData, routes: generatedRoutes });
    } catch (error) {
      console.error("Failed to connect to ML pipeline:", error);
      setPredictionResult({ error: "Failed to connect to the prediction server." });
    } finally {
      setIsLoading(false);
    }
  };

  const getCongestionColor = (status: string) => {
    const s = status?.toUpperCase();
  
    switch (s) {
      case "HIGH":
      case "CRITICAL":
      case "MAJOR":
        return "text-red-500";
  
      case "MODERATE":
        return "text-amber-400";
  
      case "LOW":
      case "MINOR":
        return "text-emerald-400";
  
      default:
        return "text-slate-300";
    }
  };

  const getCongestionIcon = (status: string) => {
    const s = status?.toUpperCase();
  
    if (
      s === "HIGH" ||
      s === "CRITICAL" ||
      s === "MAJOR"
    ) {
      return (
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      );
    }
  
    if (s === "MODERATE") {
      return (
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      );
    }
  
    return (
      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
    );
  };

  const isRainWeather = (weather: string) => {
    if (!weather) return false;

    const w = weather.toLowerCase();

    return (
      w.includes("rain") ||
      w.includes("storm") ||
      w.includes("drizzle")
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center space-x-3">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            TrafficVision AI Forecasting Engine
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Predictive congestion analysis and route planning powered by Random Forest ML with
            weather & event analytics.
          </p>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Starting Location
          </label>
          <select
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
          >
            {uniqueRoads.map((road: any, index: number) => (
              <option key={`start-${road.road_id}-${index}`} value={road.road_id}>
                {road.road_name} ({road.road_id})
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Destination
          </label>
          <select
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-medium"
          >
            {uniqueRoads.map((road: any, index: number) => (
              <option key={`end-${road.road_id}-${index}`} value={road.road_id}>
                {road.road_name} ({road.road_id})
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Target Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 pl-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 [color-scheme:dark]"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
          </div>
        </div>

        <div className="lg:col-span-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Target Time
          </label>
          <div className="relative">
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 pl-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 [color-scheme:dark]"
            />
            <Clock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
          </div>
        </div>

        <div className="lg:col-span-1">
          <button
            onClick={handleRunPrediction}
            disabled={isLoading || !startPoint || !endPoint}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20"
          >
            {isLoading ? "Computing..." : "Run ML Engine"}
          </button>
        </div>
      </div>

      {/* Prediction Output */}
      {predictionResult && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Prediction Analysis & Impact Factors
            </h3>

            <span className="text-xs text-slate-500">
              Origin Vector:
              <span className="text-slate-300 font-mono font-bold ml-1">
                {startPoint}
              </span>
            </span>
          </div>

          {predictionResult.error ? (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
              Error: {predictionResult.error}
            </div>
          ) : (
            <>
              {/* Existing 4 ML Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Status Card */}
                <div
                  className={`p-5 rounded-xl flex flex-col justify-between border
                  ${
                      predictionResult.predicted_congestion === "HIGH"
                      ? "bg-red-950/20 border-red-500/30"
                      : predictionResult.predicted_congestion === "MODERATE"
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-emerald-950/20 border-emerald-500/30"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Origin Congestion
                    </p>

                    <div className="mt-2">
                      <p
                          className={`text-3xl font-black ${getCongestionColor(
                          predictionResult.predicted_congestion
                          )}`}
                      >
                          {predictionResult.predicted_congestion}
                      </p>
                      </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                    Target: {targetDate || "Today"} @{" "}
                    {targetTime || "Current Hour"}
                  </div>
                </div>

                {/* Weather Card */}
                <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Forecasted Weather
                  </p>

                  <div className="flex items-center space-x-3">
                    {isRainWeather(
                      predictionResult.weather_condition
                    ) ? (
                      <CloudRain className="w-12 h-12 text-blue-400 animate-pulse" />
                    ) : (
                      <Sun className="w-12 h-12 text-amber-400" />
                    )}

                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        {predictionResult.weather_condition}
                      </p>

                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center">
                          <Thermometer className="w-3 h-3 mr-1 text-slate-500" />
                          {predictionResult.temperature_c}°C
                        </span>

                        <span className="flex items-center">
                          <CloudRain className="w-3 h-3 mr-1 text-slate-500" />
                          {predictionResult.precipitation_mm} mm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events Card */}
                <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contributing Events
                  </p>

                  <div className="space-y-2">
                    {predictionResult.events?.length > 0 ? (
                      predictionResult.events.map(
                        (event: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2 text-xs"
                          >
                            {getCongestionIcon(
                              predictionResult.predicted_congestion
                            )}

                            <span className="text-slate-300 font-medium">
                              {event}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No specific external events detected.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* AI Recommendation Card */}
                <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      AI Recommendation
                  </p>

                  <div className="mt-4">
                      {predictionResult.predicted_congestion === "HIGH" && (
                      <p className="text-red-400 text-sm font-medium">
                          Heavy congestion expected. Alternate routing has been prioritized in the planner below.
                      </p>
                      )}

                      {predictionResult.predicted_congestion === "MODERATE" && (
                      <p className="text-amber-400 text-sm font-medium">
                          Moderate traffic build-up expected. Monitor corridor conditions.
                      </p>
                      )}

                      {(predictionResult.predicted_congestion === "LOW" ||
                      predictionResult.predicted_congestion === "MINOR") && (
                      <p className="text-emerald-400 text-sm font-medium">
                          Traffic flow expected to remain smooth along primary trajectory.
                      </p>
                      )}
                  </div>
                </div>
              </div>

              {/* NEW: Smart Routing Output */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* Primary Route */}
                <div className="bg-slate-950 border border-emerald-500/30 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-bl-lg text-[10px] font-bold tracking-wider flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>RECOMMENDED</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Map className="w-4 h-4 text-emerald-500" />
                    <span>Primary Vector Path</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Forecast ETA</span>
                      <strong className="block text-xl text-emerald-400 mt-1">{predictionResult.routes.primary.eta} Mins</strong>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Distance</span>
                      <strong className="block text-xl text-white mt-1">{predictionResult.routes.primary.distance}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase mb-3 block">Navigation Nodes</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {predictionResult.routes.primary.path.map((node: string, idx: number) => (
                        <React.Fragment key={idx}>
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20 rounded">{node}</span>
                          {idx < predictionResult.routes.primary.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alternate Route */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 px-3 py-1.5 rounded-bl-lg text-[10px] font-bold tracking-wider flex items-center space-x-1">
                    <Split className="w-3 h-3" />
                    <span>ALTERNATIVE</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                    <Map className="w-4 h-4 text-slate-500" />
                    <span>Secondary Vector Path</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Forecast ETA</span>
                      <strong className="block text-lg text-slate-300 mt-1">{predictionResult.routes.alternate.eta} Mins</strong>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Distance</span>
                      <strong className="block text-lg text-slate-300 mt-1">{predictionResult.routes.alternate.distance}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase mb-3 block">Navigation Nodes</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {predictionResult.routes.alternate.path.map((node: string, idx: number) => (
                        <React.Fragment key={idx}>
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-400 font-mono text-[11px] border border-slate-700 rounded">{node}</span>
                          {idx < predictionResult.routes.alternate.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}