import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function BMDMultiPatientTrend({ analyses, isLoading }) {
  const [selectedPatients, setSelectedPatients] = useState("all");
  const [showBMD, setShowBMD] = useState(true);
  const [showTScore, setShowTScore] = useState(true);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique patients
  const uniquePatients = [...new Set(analyses.map(a => a.patient_name))];
  
  // Prepare data grouped by patient
  const patientData = {};
  analyses.forEach(analysis => {
    const patientName = analysis.patient_name;
    if (!patientData[patientName]) {
      patientData[patientName] = [];
    }
    patientData[patientName].push({
      date: format(new Date(analysis.created_date), 'MMM dd, yyyy'),
      timestamp: new Date(analysis.created_date).getTime(),
      bmd: analysis.predicted_bmd_gm_cm2,
      tscore: analysis.predicted_t_score,
      region: analysis.anatomical_region
    });
  });

  // Sort each patient's data by timestamp
  Object.keys(patientData).forEach(patient => {
    patientData[patient].sort((a, b) => a.timestamp - b.timestamp);
  });

  // Create unified timeline data
  const timelineData = [];
  const allTimestamps = new Set();
  
  Object.values(patientData).forEach(data => {
    data.forEach(point => allTimestamps.add(point.timestamp));
  });
  
  const sortedTimestamps = Array.from(allTimestamps).sort();
  
  sortedTimestamps.forEach(timestamp => {
    const dataPoint = { 
      date: format(new Date(timestamp), 'MMM dd'),
      timestamp 
    };
    
    Object.keys(patientData).forEach(patient => {
      const patientPoint = patientData[patient].find(p => p.timestamp === timestamp);
      if (patientPoint) {
        dataPoint[`${patient}_bmd`] = patientPoint.bmd;
        dataPoint[`${patient}_tscore`] = patientPoint.tscore;
      }
    });
    
    timelineData.push(dataPoint);
  });

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
  ];

  const exportChart = () => {
    const svg = document.querySelector('.bmd-trend-chart svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "bmd_trend_chart.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const displayPatients = selectedPatients === "all" 
    ? uniquePatients.slice(0, 5) 
    : [selectedPatients];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Multi-Patient BMD Trend Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedPatients} onValueChange={setSelectedPatients}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients (Top 5)</SelectItem>
                {uniquePatients.map(patient => (
                  <SelectItem key={patient} value={patient}>{patient}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showBMD} 
                onChange={(e) => setShowBMD(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Show BMD</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showTScore} 
                onChange={(e) => setShowTScore(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Show T-Score</span>
            </label>
          </div>

          <div className="bmd-trend-chart">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'BMD (g/cm²)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'T-Score (SD)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                
                {displayPatients.map((patient, index) => (
                  <React.Fragment key={patient}>
                    {showBMD && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={`${patient}_bmd`}
                        name={`${patient} BMD`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {showTScore && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey={`${patient}_tscore`}
                        name={`${patient} T-Score`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-500 mt-4">
            <p>📊 This chart shows bone density trends over time. Solid lines represent BMD values, dashed lines show T-Scores.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}