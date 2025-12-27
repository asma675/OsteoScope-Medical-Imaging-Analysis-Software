import React, { useState } from "react";
import { apiClient } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FractureDetection({ analysis }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [error, setError] = useState(null);

  const detectFractures = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const prompt = `You are an expert radiologist specializing in bone fracture detection and orthopedic assessment. 

Analyze this X-ray image and provide a detailed fracture and bone issue assessment:

Patient Information:
- Name: ${analysis.patient_name}
- Age: ${analysis.patient_age} years
- Gender: ${analysis.patient_gender}
- Anatomical Region: ${analysis.anatomical_region}

Current Analysis Data:
- T-Score: ${analysis.predicted_t_score}
- Risk Category: ${analysis.osteoporosis_risk_category}
- BMD: ${analysis.predicted_bmd_gm_cm2} g/cm²

Provide a comprehensive assessment including:
1. Any visible fractures (location, type, severity)
2. Bone abnormalities or pathologies
3. Structural integrity issues
4. Degenerative changes
5. Overall bone health assessment
6. Urgency level for medical attention
7. Recommended next steps

Be thorough but clear in your medical terminology.`;

      const result = await apiClient.integrations.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        file_urls: [analysis.image_url],
        response_json_schema: {
          type: "object",
          properties: {
            fractures_detected: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  location: { type: "string" },
                  type: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            bone_abnormalities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  finding: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            structural_issues: { type: "string" },
            degenerative_changes: { type: "string" },
            overall_assessment: { type: "string" },
            urgency_level: { type: "string" },
            recommended_actions: {
              type: "array",
              items: { type: "string" }
            },
            confidence_score: { type: "number" }
          }
        }
      });

      setDetectionResults(result);
    } catch (err) {
      console.error("Fracture detection error:", err);
      setError(err.message || "Failed to analyze X-ray for fractures");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const lower = severity?.toLowerCase() || '';
    if (lower.includes('severe') || lower.includes('critical')) return 'bg-red-100 text-red-800 border-red-300';
    if (lower.includes('moderate')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getUrgencyIcon = (urgency) => {
    const lower = urgency?.toLowerCase() || '';
    if (lower.includes('urgent') || lower.includes('immediate')) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (lower.includes('routine')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI Fracture Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!detectionResults && !error && (
          <div className="text-center py-6">
            <p className="text-slate-600 mb-4">
              Use AI to detect fractures and bone issues in this X-ray
            </p>
            <Button
              onClick={detectFractures}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Detect Fractures & Issues
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {detectionResults && (
          <div className="space-y-6">
            {/* Fractures Detected */}
            {detectionResults.fractures_detected?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Fractures Detected ({detectionResults.fractures_detected.length})
                </h3>
                {detectionResults.fractures_detected.map((fracture, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{fracture.location}</p>
                        <p className="text-sm text-slate-600">{fracture.type}</p>
                      </div>
                      <Badge className={getSeverityColor(fracture.severity)}>
                        {fracture.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mt-2">{fracture.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Bone Abnormalities */}
            {detectionResults.bone_abnormalities?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Bone Abnormalities</h3>
                {detectionResults.bone_abnormalities.map((abnormality, idx) => (
                  <div key={idx} className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded">
                    <p className="font-medium text-slate-900 text-sm">{abnormality.finding}</p>
                    <p className="text-xs text-slate-600 mt-1">{abnormality.significance}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Overall Assessment */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Overall Assessment</h3>
              <p className="text-sm text-slate-700">{detectionResults.overall_assessment}</p>
            </div>

            {/* Urgency Level */}
            {detectionResults.urgency_level && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {getUrgencyIcon(detectionResults.urgency_level)}
                <div>
                  <p className="text-sm font-medium text-slate-900">Urgency Level</p>
                  <p className="text-sm text-slate-600">{detectionResults.urgency_level}</p>
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {detectionResults.recommended_actions?.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">Recommended Actions</h3>
                <ul className="space-y-2">
                  {detectionResults.recommended_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confidence Score */}
            {detectionResults.confidence_score && (
              <div className="text-center pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  AI Confidence: <span className="font-semibold text-slate-900">{detectionResults.confidence_score}%</span>
                </p>
              </div>
            )}

            <Button
              onClick={detectFractures}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}