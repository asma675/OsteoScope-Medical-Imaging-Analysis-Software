import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Users } from "lucide-react";

export default function TScoreComparison({ analysis }) {
  const populationData = [
    {
      category: "Young Adult Average",
      tScore: 0,
      color: "#10b981"
    },
    {
      category: "Age-Matched Average",
      tScore: -0.5,
      color: "#3b82f6"
    },
    {
      category: "Your T-Score",
      tScore: analysis.predicted_t_score,
      color: analysis.predicted_t_score > -1 ? "#10b981" : analysis.predicted_t_score > -2.5 ? "#f59e0b" : "#ef4444"
    }
  ];

  const getRiskZone = (tScore) => {
    if (tScore > -1) return { zone: "Normal", color: "#10b981" };
    if (tScore > -2.5) return { zone: "Osteopenia", color: "#f59e0b" };
    return { zone: "Osteoporosis", color: "#ef4444" };
  };

  const patientRisk = getRiskZone(analysis.predicted_t_score);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          T-Score Population Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={populationData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[-4, 1]} />
            <YAxis type="category" dataKey="category" width={150} fontSize={12} />
            <Tooltip />
            <ReferenceLine x={-1} stroke="#f59e0b" strokeDasharray="3 3" />
            <ReferenceLine x={-2.5} stroke="#ef4444" strokeDasharray="3 3" />
            <Bar dataKey="tScore" name="T-Score">
              {populationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs text-slate-600 mb-1">Normal</div>
            <div className="font-bold text-green-700">&gt; -1.0</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-xs text-slate-600 mb-1">Osteopenia</div>
            <div className="font-bold text-yellow-700">-1.0 to -2.5</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs text-slate-600 mb-1">Osteoporosis</div>
            <div className="font-bold text-red-700">&lt; -2.5</div>
          </div>
        </div>

        <div className="p-4 rounded-lg border-2" style={{ borderColor: patientRisk.color, backgroundColor: `${patientRisk.color}10` }}>
          <p className="text-sm">
            <strong>Your Status:</strong> {patientRisk.zone}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            T-Score: {analysis.predicted_t_score?.toFixed(1)} (Confidence: {analysis.confidence_level}%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}