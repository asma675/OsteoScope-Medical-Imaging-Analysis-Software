import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { format } from "date-fns";

export default function BMDTrendChart({ currentAnalysis }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoricalData();
  }, [currentAnalysis]);

  const loadHistoricalData = async () => {
    try {
      const allAnalyses = await apiClient.entities.XRayAnalysis.filter(
        { 
          patient_name: currentAnalysis.patient_name,
          analysis_status: "completed"
        },
        "-created_date"
      );

      const chartData = allAnalyses.reverse().map(analysis => ({
        date: format(new Date(analysis.created_date), 'MMM dd, yyyy'),
        bmd: analysis.predicted_bmd_gm_cm2,
        tScore: analysis.predicted_t_score,
        timestamp: new Date(analysis.created_date).getTime()
      }));

      setHistoricalData(chartData);
    } catch (error) {
      console.error("Failed to load historical data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (historicalData.length < 2) return <Minus className="w-5 h-5 text-slate-400" />;
    const first = historicalData[0].bmd;
    const last = historicalData[historicalData.length - 1].bmd;
    if (last > first) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (last < first) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>BMD Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (historicalData.length < 2) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>BMD Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>Multiple analyses required to show trends</p>
            <p className="text-sm mt-2">Current analysis: {historicalData.length} record(s)</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            BMD Trend Analysis
            {getTrendIcon()}
          </CardTitle>
          <span className="text-sm text-slate-500">
            {historicalData.length} measurements
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="3 3" label="Osteoporosis" />
            <ReferenceLine y={1.0} stroke="#f59e0b" strokeDasharray="3 3" label="Osteopenia" />
            <Line type="monotone" dataKey="bmd" stroke="#3b82f6" strokeWidth={2} name="BMD (g/cm²)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}