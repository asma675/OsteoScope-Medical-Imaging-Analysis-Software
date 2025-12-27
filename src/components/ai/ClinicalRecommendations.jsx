import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clipboard } from 'lucide-react';

export default function ClinicalRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Clipboard className="w-5 h-5" />
          <span>Clinical Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex gap-3 bg-white/70 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}