import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, Activity, BarChart3, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import BMDMultiPatientTrend from "../components/analytics/BMDMultiPatientTrend";
import RegionalTScoreComparison from "../components/analytics/RegionalTScoreComparison";
import RiskFactorCorrelation from "../components/analytics/RiskFactorCorrelation";
import PopulationDistribution from "../components/analytics/PopulationDistribution";

export default function AnalyticsPage() {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
  const [selectedTab, setSelectedTab] = useState("trends");

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const data = await apiClient.entities.XRayAnalysis.filter(
        { analysis_status: "completed" },
        "-created_date",
        200
      );
      setAnalyses(data);
    } catch (error) {
      console.error("Failed to load analyses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterByTimeRange = (data) => {
    if (timeRange === "all") return data;
    
    const now = new Date();
    const cutoff = new Date();
    
    switch(timeRange) {
      case "30d":
        cutoff.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoff.setDate(now.getDate() - 90);
        break;
      case "1y":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(a => new Date(a.created_date) >= cutoff);
  };

  const exportData = async () => {
    const filteredData = filterByTimeRange(analyses);
    const csvContent = [
      ["Patient", "Date", "Region", "T-Score", "BMD", "Risk Category"].join(","),
      ...filteredData.map(a => [
        a.patient_name,
        new Date(a.created_date).toLocaleDateString(),
        a.anatomical_region,
        a.predicted_t_score?.toFixed(2) || "N/A",
        a.predicted_bmd_gm_cm2?.toFixed(3) || "N/A",
        a.osteoporosis_risk_category || "N/A"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAnalyses = filterByTimeRange(analyses);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Analytics</h1>
            <p className="text-slate-600">Interactive visualizations and data insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Analyses</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredAnalyses.length}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg T-Score</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredAnalyses.length > 0 
                      ? (filteredAnalyses.reduce((sum, a) => sum + (a.predicted_t_score || 0), 0) / filteredAnalyses.length).toFixed(1)
                      : "N/A"
                    }
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">High Risk</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredAnalyses.filter(a => 
                      a.osteoporosis_risk_category === "osteoporosis" || 
                      a.osteoporosis_risk_category === "severe_osteoporosis"
                    ).length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unique Patients</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Set(filteredAnalyses.map(a => a.patient_name)).size}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Charts */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="trends">BMD Trends</TabsTrigger>
            <TabsTrigger value="regional">Regional Compare</TabsTrigger>
            <TabsTrigger value="correlation">Risk Factors</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <BMDMultiPatientTrend analyses={filteredAnalyses} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <RegionalTScoreComparison analyses={filteredAnalyses} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <RiskFactorCorrelation analyses={filteredAnalyses} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <PopulationDistribution analyses={filteredAnalyses} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}