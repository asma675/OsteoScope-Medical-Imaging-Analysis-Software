import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Shield } from 'lucide-react';

export default function RiskAssessment({ analysis }) {
  const getRiskColor = (category) => {
    const colors = {
      low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' },
      moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
      high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' },
      very_high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' }
    };
    return colors[category] || colors.moderate;
  };

  const colors = getRiskColor(analysis.fracture_risk_category);

  return (
    <Card className={`${colors.bg} ${colors.border} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${colors.text}`} />
            <span className={colors.text}>Fracture Risk Assessment</span>
          </div>
          <Badge className={colors.badge}>
            {analysis.fracture_risk_category.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Gauge */}
        <div className="text-center space-y-3">
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#riskGradient)"
                strokeWidth="12"
                strokeDasharray={`${(analysis.fracture_risk_score / 100) * 440} 440`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-slate-900">{analysis.fracture_risk_score}%</span>
              <span className="text-sm text-slate-600">10-Year Risk</span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Estimated probability of major osteoporotic fracture within 10 years
          </p>
        </div>

        {/* Bone Density Assessment */}
        {analysis.bone_density_assessment && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Activity className="w-4 h-4" />
              <span>Bone Density Evaluation</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Trabecular Quality</p>
                <p className="text-sm font-semibold text-slate-900">
                  {analysis.bone_density_assessment.trabecular_quality}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Cortical Integrity</p>
                <p className="text-sm font-semibold text-slate-900">
                  {analysis.bone_density_assessment.cortical_integrity}
                </p>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Age Comparison</p>
              <p className="text-sm font-semibold text-slate-900">
                {analysis.bone_density_assessment.age_comparison}
              </p>
            </div>
          </div>
        )}

        {/* Intervention Urgency */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-600">Intervention Urgency:</span>
          </div>
          <Badge variant="outline" className="font-semibold">
            {analysis.intervention_urgency.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}