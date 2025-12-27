import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EnhancedXRayViewer({ analysis }) {
  const [zoom, setZoom] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);

  const getConcernAreas = () => {
    const areas = [];
    const riskCategory = analysis.osteoporosis_risk_category;
    
    if (riskCategory === "osteoporosis" || riskCategory === "severe_osteoporosis") {
      areas.push({
        label: "High Risk Area",
        color: "rgba(239, 68, 68, 0.3)",
        severity: "high"
      });
    } else if (riskCategory === "osteopenia") {
      areas.push({
        label: "Moderate Risk Area",
        color: "rgba(245, 158, 11, 0.3)",
        severity: "moderate"
      });
    }

    if (analysis.cortical_thickness_mm && analysis.cortical_thickness_mm < 3) {
      areas.push({
        label: "Thin Cortical Bone",
        color: "rgba(239, 68, 68, 0.25)",
        severity: "high"
      });
    }

    return areas;
  };

  const concernAreas = getConcernAreas();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>X-Ray Analysis</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowOverlay(!showOverlay)}
            >
              {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden bg-slate-900 rounded-lg" style={{ height: "400px" }}>
          <div className="absolute inset-0 flex items-center justify-center overflow-auto">
            <div style={{ transform: `scale(${zoom})`, transition: "transform 0.2s" }}>
              <img
                src={analysis.image_url}
                alt="X-Ray"
                className="max-w-full h-auto"
              />
              
              {showOverlay && concernAreas.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ mixBlendMode: "multiply" }}
                >
                  <rect
                    x="20%"
                    y="30%"
                    width="60%"
                    height="40%"
                    fill={concernAreas[0].color}
                    stroke={concernAreas[0].severity === "high" ? "#ef4444" : "#f59e0b"}
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    rx="8"
                  />
                  <text
                    x="50%"
                    y="25%"
                    textAnchor="middle"
                    fill={concernAreas[0].severity === "high" ? "#ef4444" : "#f59e0b"}
                    fontSize="16"
                    fontWeight="bold"
                  >
                    {concernAreas[0].label}
                  </text>
                </svg>
              )}
            </div>
          </div>
        </div>

        {concernAreas.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">Identified Concerns:</p>
            <div className="flex flex-wrap gap-2">
              {concernAreas.map((area, index) => (
                <Badge 
                  key={index}
                  className={
                    area.severity === "high" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {area.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-slate-500">
          <p>Region: <span className="font-medium capitalize">{analysis.anatomical_region?.replace('_', ' ')}</span></p>
          <p>Analysis Date: {new Date(analysis.created_date).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}