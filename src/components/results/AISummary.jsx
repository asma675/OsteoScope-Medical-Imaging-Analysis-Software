import React, { useState } from "react";
import { apiClient } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Markdown from "react-markdown";

export default function AISummary({ analysis }) {
  const [summary, setSummary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate a comprehensive clinical report for this osteoporosis analysis:

PATIENT DATA:
- Name: ${analysis.patient_name}
- Age: ${analysis.patient_age}
- Gender: ${analysis.patient_gender}
- Anatomical Region: ${analysis.anatomical_region?.replace('_', ' ')}

ANALYSIS FINDINGS:
- Risk Category: ${analysis.osteoporosis_risk_category?.replace('_', ' ')}
- T-Score: ${analysis.predicted_t_score?.toFixed(1)}
- BMD: ${analysis.predicted_bmd_gm_cm2?.toFixed(3)} g/cm²
- Confidence: ${analysis.confidence_level}%
${analysis.singh_index ? `- Singh Index: ${analysis.singh_index}` : ''}
${analysis.jhamaria_index ? `- Jhamaria Index: ${analysis.jhamaria_index}` : ''}
${analysis.cortical_thickness_mm ? `- Cortical Thickness: ${analysis.cortical_thickness_mm} mm` : ''}
- Clinical Recommendation: ${analysis.dxa_recommendation?.replace('_', ' ')}
${analysis.analysis_notes ? `- Additional Notes: ${analysis.analysis_notes}` : ''}

Generate a comprehensive report with the following sections:

**EXECUTIVE SUMMARY**
Brief overview of bone health status and key findings (2-3 sentences)

**DIFFERENTIAL DIAGNOSES**
List 3-4 potential diagnoses ranked by likelihood, considering:
- Primary osteoporosis vs secondary causes
- Age and gender-related factors
- Other metabolic bone diseases
Format: "1. [Diagnosis] - [Brief reasoning]"

**FRACTURE RISK & COMPLICATIONS**
- Specific fracture sites at highest risk
- Timeline and probability of complications
- Activities or conditions that increase risk

**PERSONALIZED TREATMENT PLAN**
Comprehensive management strategy including:
- Pharmacological interventions (if indicated)
- Lifestyle modifications (diet, exercise, fall prevention)
- Supplementation recommendations (calcium, vitamin D)
- Physical therapy considerations

**FOLLOW-UP RECOMMENDATIONS**
- Timing for next DXA scan or follow-up
- Lab tests to order (vitamin D, calcium, PTH, etc.)
- Specialist referrals if needed
- Monitoring parameters

**CONTRAINDICATIONS & SAFETY ALERTS**
- Medications to avoid or use with caution
- Treatment contraindications based on age/gender/findings
- Drug interactions to monitor
- Red flags requiring immediate attention

Format this professionally for clinical use while remaining clear and actionable.`;

      const result = await apiClient.integrations.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setSummary(result);
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setError("Failed to generate comprehensive report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Comprehensive Clinical Report
          </CardTitle>
          {summary && (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summary && !isGenerating && (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">
              Generate a comprehensive clinical report including diagnoses, treatment plans, and safety alerts
            </p>
            <Button 
              onClick={generateSummary}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Comprehensive Report
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Generating comprehensive clinical report...</p>
            <p className="text-xs text-slate-500 mt-2">Analyzing findings, generating diagnoses, and formulating treatment plans...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && (
          <div className="prose prose-slate max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <Markdown className="text-slate-700 leading-relaxed space-y-4 text-sm">
                {summary}
              </Markdown>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Clinical Disclaimer:</strong> This AI-generated report is for informational purposes only. 
                All treatment decisions should be made by qualified healthcare professionals after thorough patient evaluation.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}