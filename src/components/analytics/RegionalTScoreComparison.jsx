import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegionalTScoreComparison({ analyses, isLoading }) {
  const [groupBy, setGroupBy] = useState("region");
  const [showRiskZones, setShowRiskZones] = useState(true);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="animate-pulse h-96 bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Group data by anatomical region
  const regionData = {};
  analyses.forEach(analysis => {
    const region = analysis.anatomical_region || "unknown";
    if (!regionData[region]) {
      regionData[region] = {
        region: region.replace(/_/g, ' '),
        tscores: [],
        bmds: [],
        count: 0
      };
    }
    if (analysis.predicted_t_score) {
      regionData[region].tscores.push(analysis.predicted_t_score);
    }
    if (analysis.predicted_bmd_gm_cm2) {
      regionData[region].bmds.push(analysis.predicted_bmd_gm_cm2);
    }
    regionData[region].count++;
  });

  // Calculate averages
  const chartData = Object.values(regionData).map(data => ({
    region: data.region,
    avgTScore: data.tscores.length > 0 
      ? data.tscores.reduce((a, b) => a + b, 0) / data.tscores.length 
      : 0,
    avgBMD: data.bmds.length > 0 
      ? data.bmds.reduce((a, b) => a + b, 0) / data.bmds.length 
      : 0,
    count: data.count,
    minTScore: Math.min(...data.tscores),
    maxTScore: Math.max(...data.tscores)
  }));

  const getRiskColor = (tscore) => {
    if (tscore >= -1.0) return "#10b981"; // Normal - green
    if (tscore >= -2.5) return "#f59e0b"; // Osteopenia - yellow
    return "#ef4444"; // Osteoporosis - red
  };

  const exportChart = () => {
    const csvContent = [
      ["Region", "Avg T-Score", "Avg BMD", "Sample Count", "Min T-Score", "Max T-Score"].join(","),
      ...chartData.map(d => [
        d.region,
        d.avgTScore.toFixed(2),
        d.avgBMD.toFixed(3),
        d.count,
        d.minTScore.toFixed(2),
        d.maxTScore.toFixed(2)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "regional_comparison.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Regional T-Score Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showRiskZones} 
                onChange={(e) => setShowRiskZones(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Show Risk Zones</span>
            </label>
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="region" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                label={{ value: 'T-Score (SD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => {
                  if (name === "avgTScore") {
                    return [
                      `${value.toFixed(2)} SD`,
                      `Avg T-Score (n=${props.payload.count})`
                    ];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              
              {showRiskZones && (
                <>
                  <ReferenceLine y={-1.0} stroke="#10b981" strokeDasharray="3 3" label="Normal" />
                  <ReferenceLine y={-2.5} stroke="#ef4444" strokeDasharray="3 3" label="Osteoporosis" />
                </>
              )}
              
              <Bar dataKey="avgTScore" name="Average T-Score" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRiskColor(entry.avgTScore)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend for risk zones */}
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-slate-700">Normal (T-Score ≥ -1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-slate-700">Osteopenia (-2.5 &lt; T-Score &lt; -1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-slate-700">Osteoporosis (T-Score ≤ -2.5)</span>
            </div>
          </div>

          {/* Regional Statistics Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-center">Avg T-Score</th>
                  <th className="px-4 py-2 text-center">Range</th>
                  <th className="px-4 py-2 text-center">Samples</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="px-4 py-2 capitalize">{data.region}</td>
                    <td className="px-4 py-2 text-center font-semibold" style={{ color: getRiskColor(data.avgTScore) }}>
                      {data.avgTScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">
                      {data.minTScore.toFixed(1)} to {data.maxTScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-center text-slate-600">{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}