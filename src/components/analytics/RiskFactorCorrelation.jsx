import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RiskFactorCorrelation({ analyses, isLoading }) {
  const [xAxis, setXAxis] = useState("age");
  const [yAxis, setYAxis] = useState("tscore");

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="animate-pulse h-96 bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Prepare scatter data
  const scatterData = analyses.filter(a => a.patient_age && a.predicted_t_score).map(analysis => {
    const riskCategory = analysis.osteoporosis_risk_category || "unknown";
    return {
      name: analysis.patient_name,
      age: analysis.patient_age,
      tscore: analysis.predicted_t_score,
      bmd: analysis.predicted_bmd_gm_cm2,
      confidence: analysis.confidence_level || 0,
      gender: analysis.patient_gender,
      region: analysis.anatomical_region,
      riskCategory: riskCategory,
      color: getRiskColor(riskCategory)
    };
  });

  function getRiskColor(category) {
    const colors = {
      normal: "#10b981",
      osteopenia: "#f59e0b",
      osteoporosis: "#ef4444",
      severe_osteoporosis: "#991b1b",
      unknown: "#94a3b8"
    };
    return colors[category] || colors.unknown;
  }

  const getAxisValue = (data, axis) => {
    switch(axis) {
      case "age": return data.age;
      case "tscore": return data.tscore;
      case "bmd": return data.bmd;
      case "confidence": return data.confidence;
      default: return 0;
    }
  };

  const getAxisLabel = (axis) => {
    const labels = {
      age: "Age (years)",
      tscore: "T-Score (SD)",
      bmd: "BMD (g/cm²)",
      confidence: "Confidence Level (%)"
    };
    return labels[axis];
  };

  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    if (scatterData.length < 2) return 0;
    
    const xData = scatterData.map(d => getAxisValue(d, xAxis));
    const yData = scatterData.map(d => getAxisValue(d, yAxis));
    
    const n = xData.length;
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
    const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = yData.reduce((sum, y) => sum + y * y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();
  const correlationStrength = Math.abs(correlation) > 0.7 ? "Strong" : 
                               Math.abs(correlation) > 0.4 ? "Moderate" : "Weak";

  const exportData = () => {
    const csvContent = [
      ["Patient", "Age", "T-Score", "BMD", "Confidence", "Gender", "Region", "Risk Category"].join(","),
      ...scatterData.map(d => [
        d.name,
        d.age,
        d.tscore.toFixed(2),
        d.bmd?.toFixed(3) || "N/A",
        d.confidence,
        d.gender,
        d.region,
        d.riskCategory
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "correlation_analysis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Risk Factor Correlation Analysis
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Axis Selection */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">X-Axis:</span>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="bmd">BMD</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">Y-Axis:</span>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tscore">T-Score</SelectItem>
                  <SelectItem value="bmd">BMD</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Correlation Coefficient */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Correlation Coefficient (r)</p>
                <p className="text-2xl font-bold text-blue-600">{correlation.toFixed(3)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Strength</p>
                <p className="text-lg font-semibold text-slate-700">{correlationStrength}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {correlation > 0 ? "Positive" : "Negative"} correlation between {getAxisLabel(xAxis)} and {getAxisLabel(yAxis)}
            </p>
          </div>

          {/* Scatter Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey={(d) => getAxisValue(d, xAxis)}
                name={getAxisLabel(xAxis)}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                label={{ value: getAxisLabel(xAxis), position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey={(d) => getAxisValue(d, yAxis)}
                name={getAxisLabel(yAxis)}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                label={{ value: getAxisLabel(yAxis), angle: -90, position: 'insideLeft' }}
              />
              <ZAxis range={[60, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [value, name]}
                labelFormatter={() => ''}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-slate-900">{data.name}</p>
                        <p className="text-sm text-slate-600">Age: {data.age} years</p>
                        <p className="text-sm text-slate-600">T-Score: {data.tscore.toFixed(2)}</p>
                        <p className="text-sm text-slate-600">BMD: {data.bmd?.toFixed(3)} g/cm²</p>
                        <p className="text-sm capitalize" style={{ color: data.color }}>
                          Risk: {data.riskCategory.replace('_', ' ')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Patients" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-slate-700">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-700">Osteopenia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-slate-700">Osteoporosis</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}