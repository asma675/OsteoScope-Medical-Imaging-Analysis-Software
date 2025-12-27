import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowLeft, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

import AnomalyCard from '../components/ai/AnomalyCard';
import RiskAssessment from '../components/ai/RiskAssessment';
import PredictiveInsights from '../components/ai/PredictiveInsights';
import ClinicalRecommendations from '../components/ai/ClinicalRecommendations';
import PopulationComparison from '../components/ai/PopulationComparison';
import AIReportSummary from '../components/ai/AIReportSummary';

export default function AIAnalysisPage() {
  const navigate = useNavigate();
  const [xrayAnalysisId, setXrayAnalysisId] = useState(null);
  const [xrayAnalysis, setXrayAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('xrayId');
    if (id) {
      setXrayAnalysisId(id);
      loadAnalysisData(id);
    } else {
      setError('No X-ray analysis ID provided');
      setIsLoading(false);
    }
  }, []);

  const loadAnalysisData = async (id) => {
    try {
      setIsLoading(true);
      
      // Load X-ray analysis
      const xrayList = await apiClient.entities.XRayAnalysis.list();
      const xray = xrayList.find(x => x.id === id);
      
      if (!xray) {
        setError('X-ray analysis not found');
        return;
      }
      
      setXrayAnalysis(xray);

      // Check if AI analysis already exists
      const aiList = await apiClient.entities.AIAnalysis.list();
      const existing = aiList.find(a => a.xray_analysis_id === id);
      
      if (existing) {
        setAiAnalysis(existing);
      }
      
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load analysis data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    if (!xrayAnalysis) return;
    
    setIsGenerating(true);
    setError(null);
    
    const startTime = Date.now();

    try {
      // Prepare context for AI
      const analysisContext = `
Patient: ${xrayAnalysis.patient_name}, Age: ${xrayAnalysis.patient_age}, Gender: ${xrayAnalysis.patient_gender}
Anatomical Region: ${xrayAnalysis.anatomical_region}
T-Score: ${xrayAnalysis.predicted_t_score}
BMD: ${xrayAnalysis.predicted_bmd_gm_cm2} g/cm²
Risk Category: ${xrayAnalysis.osteoporosis_risk_category}
Texture Metrics:
- Contrast: ${xrayAnalysis.texture_contrast}
- Homogeneity: ${xrayAnalysis.texture_homogeneity}
- Energy: ${xrayAnalysis.texture_energy}
- Entropy: ${xrayAnalysis.texture_entropy}
- Fractal Dimension: ${xrayAnalysis.fractal_dimension}
${xrayAnalysis.cortical_thickness_mm ? `Cortical Thickness: ${xrayAnalysis.cortical_thickness_mm} mm` : ''}
${xrayAnalysis.singh_index ? `Singh Index: ${xrayAnalysis.singh_index}` : ''}
${xrayAnalysis.jhamaria_index ? `Jhamaria Index: ${xrayAnalysis.jhamaria_index}` : ''}
Clinical Notes: ${xrayAnalysis.analysis_notes || 'None'}
      `.trim();

      // Generate comprehensive AI analysis
      const aiResponse = await apiClient.integrations.InvokeLLM({
        prompt: `You are an expert radiologist and osteoporosis specialist analyzing bone density scans. Based on the following medical data, provide a comprehensive AI-powered analysis:

${analysisContext}

Generate a detailed JSON response with the following structure:
{
  "anomalies_detected": [
    {
      "type": "string (e.g., 'Trabecular Deterioration', 'Cortical Thinning', 'Fracture Risk Zone')",
      "severity": "string (critical/high/moderate/low/minimal)",
      "location": "string (specific anatomical location)",
      "confidence": number (0-100),
      "description": "string (detailed clinical description)"
    }
  ],
  "fracture_risk_score": number (0-100, representing 10-year fracture probability),
  "fracture_risk_category": "string (low/moderate/high/very_high)",
  "bone_density_assessment": {
    "overall_score": number (0-100),
    "trabecular_quality": "string (excellent/good/fair/poor/very poor)",
    "cortical_integrity": "string (intact/mild thinning/moderate thinning/severe thinning)",
    "age_comparison": "string (comparison to age-matched norms)"
  },
  "predictive_insights": [
    {
      "category": "string (fracture/progression/intervention/outcome)",
      "prediction": "string (specific prediction)",
      "timeframe": "string (e.g., '6 months', '1-2 years')",
      "confidence": number (0-100)
    }
  ],
  "clinical_recommendations": ["array of specific, actionable clinical recommendations"],
  "report_summary": "string (2-3 paragraph executive summary for clinicians)",
  "detailed_findings": "string (comprehensive detailed findings)",
  "comparison_to_population": {
    "percentile": number (0-100),
    "age_group": "string (e.g., '50-60 years')",
    "interpretation": "string (clinical interpretation of percentile ranking)"
  },
  "intervention_urgency": "string (routine/standard/priority/urgent)",
  "ai_confidence_score": number (0-100)
}

Be thorough, specific, and clinically accurate. Identify at least 2-4 significant findings.`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies_detected: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  severity: { type: "string" },
                  location: { type: "string" },
                  confidence: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            fracture_risk_score: { type: "number" },
            fracture_risk_category: { type: "string" },
            bone_density_assessment: { 
              type: "object",
              properties: {
                overall_score: { type: "number" },
                trabecular_quality: { type: "string" },
                cortical_integrity: { type: "string" },
                age_comparison: { type: "string" }
              }
            },
            predictive_insights: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  prediction: { type: "string" },
                  timeframe: { type: "string" },
                  confidence: { type: "number" }
                }
              }
            },
            clinical_recommendations: { 
              type: "array",
              items: { type: "string" }
            },
            report_summary: { type: "string" },
            detailed_findings: { type: "string" },
            comparison_to_population: { 
              type: "object",
              properties: {
                percentile: { type: "number" },
                age_group: { type: "string" },
                interpretation: { type: "string" }
              }
            },
            intervention_urgency: { type: "string" },
            ai_confidence_score: { type: "number" }
          }
        }
      });

      const processingTime = Math.round((Date.now() - startTime) / 1000);

      // Create AI analysis record
      const newAnalysis = await apiClient.entities.AIAnalysis.create({
        xray_analysis_id: xrayAnalysisId,
        patient_name: xrayAnalysis.patient_name,
        image_url: xrayAnalysis.image_url,
        anomalies_detected: aiResponse.anomalies_detected,
        fracture_risk_score: aiResponse.fracture_risk_score,
        fracture_risk_category: aiResponse.fracture_risk_category,
        bone_density_assessment: aiResponse.bone_density_assessment,
        predictive_insights: aiResponse.predictive_insights,
        clinical_recommendations: aiResponse.clinical_recommendations,
        report_summary: aiResponse.report_summary,
        detailed_findings: aiResponse.detailed_findings,
        comparison_to_population: aiResponse.comparison_to_population,
        intervention_urgency: aiResponse.intervention_urgency,
        ai_confidence_score: aiResponse.ai_confidence_score,
        analysis_timestamp: new Date().toISOString(),
        processing_time_seconds: processingTime
      });

      setAiAnalysis(newAnalysis);
      
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate AI analysis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error && !xrayAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-blue-600" />
                AI-Powered Bone Analysis
              </h1>
              <p className="text-slate-600 mt-1">Advanced anomaly detection and predictive insights</p>
            </div>
          </div>
          {!aiAnalysis && !isGenerating && (
            <Button
              onClick={generateAIAnalysis}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Analysis
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generating State */}
        {isGenerating && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <Loader2 className="w-20 h-20 animate-spin text-blue-600" />
                  <Sparkles className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-slate-600">
                    Our AI is analyzing bone structure, detecting anomalies, and generating insights...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Results */}
        {aiAnalysis && !isGenerating && (
          <div className="space-y-6">
            {/* Report Summary */}
            <AIReportSummary analysis={aiAnalysis} />

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Column - Anomalies & Findings */}
              <div className="lg:col-span-2 space-y-6">
                {/* Anomalies */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    Detected Anomalies
                  </h2>
                  <div className="space-y-4">
                    {aiAnalysis.anomalies_detected && aiAnalysis.anomalies_detected.length > 0 ? (
                      aiAnalysis.anomalies_detected.map((anomaly, index) => (
                        <AnomalyCard key={index} anomaly={anomaly} />
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center text-slate-500">
                          No significant anomalies detected
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Detailed Findings */}
                {aiAnalysis.detailed_findings && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Clinical Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis.detailed_findings}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Predictive Insights */}
                <PredictiveInsights insights={aiAnalysis.predictive_insights} />
              </div>

              {/* Sidebar - Risk & Recommendations */}
              <div className="space-y-6">
                {/* Risk Assessment */}
                <RiskAssessment analysis={aiAnalysis} />

                {/* Population Comparison */}
                <PopulationComparison comparison={aiAnalysis.comparison_to_population} />

                {/* Clinical Recommendations */}
                <ClinicalRecommendations recommendations={aiAnalysis.clinical_recommendations} />
              </div>
            </div>
          </div>
        )}

        {/* No Analysis Yet */}
        {!aiAnalysis && !isGenerating && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    AI Analysis Not Generated Yet
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Click the button above to generate comprehensive AI-powered insights for this bone scan
                  </p>
                  <Button
                    onClick={generateAIAnalysis}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate AI Analysis Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}