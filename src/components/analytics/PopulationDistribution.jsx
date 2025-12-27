import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PopulationDistribution({ analyses, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="animate-pulse h-96 bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Risk category distribution
  const riskDistribution = {};
  analyses.forEach(a => {
    const category = a.osteoporosis_risk_category || "unknown";
    riskDistribution[category] = (riskDistribution[category] || 0) + 1;
  });

  const riskData = Object.entries(riskDistribution).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    percentage: ((value / analyses.length) * 100).toFixed(1)
  }));

  const COLORS = {
    normal: "#10b981",
    osteopenia: "#f59e0b",
    osteoporosis: "#ef4444",
    "severe osteoporosis": "#991b1b",
    unknown: "#94a3b8"
  };

  // Age distribution
  const ageGroups = {
    "20-39": 0,
    "40-59": 0,
    "60-79": 0,
    "80+": 0
  };

  analyses.forEach(a => {
    const age = a.patient_age;
    if (age >= 20 && age < 40) ageGroups["20-39"]++;
    else if (age >= 40 && age < 60) ageGroups["40-59"]++;
    else if (age >= 60 && age < 80) ageGroups["60-79"]++;
    else if (age >= 80) ageGroups["80+"]++;
  });

  const ageData = Object.entries(ageGroups).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / analyses.length) * 100).toFixed(1)
  }));

  // Gender distribution
  const genderDist = {};
  analyses.forEach(a => {
    const gender = a.patient_gender || "unknown";
    genderDist[gender] = (genderDist[gender] || 0) + 1;
  });

  const genderData = Object.entries(genderDist).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: ((value / analyses.length) * 100).toFixed(1)
  }));

  const exportData = () => {
    const csvContent = [
      ["Category", "Type", "Count", "Percentage"].join(","),
      ...riskData.map(d => ["Risk", d.name, d.value, d.percentage + "%"].join(",")),
      ...ageData.map(d => ["Age", d.name, d.value, d.percentage + "%"].join(",")),
      ...genderData.map(d => ["Gender", d.name, d.value, d.percentage + "%"].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "population_distribution.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Risk Category Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Risk Category Distribution
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.unknown} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {riskData.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="capitalize text-slate-700">{item.name}</span>
                <span className="font-semibold text-slate-900">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {ageData.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-700">{item.name} years</span>
                <span className="font-semibold text-slate-900">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg md:col-span-2">
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {genderData.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{item.value}</p>
                <p className="text-sm text-slate-600 mt-2">{item.name}</p>
                <p className="text-xs text-slate-500">{item.percentage}% of total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}