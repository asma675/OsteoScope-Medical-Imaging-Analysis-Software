import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, TrendingUp } from 'lucide-react';

export default function PredictiveInsights({ insights }) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    return <Brain className="w-4 h-4" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      fracture: 'bg-red-50 border-red-200',
      progression: 'bg-orange-50 border-orange-200',
      intervention: 'bg-blue-50 border-blue-200',
      outcome: 'bg-green-50 border-green-200'
    };
    return colors[category.toLowerCase()] || 'bg-slate-50 border-slate-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <span>Predictive Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${getCategoryColor(insight.category)} space-y-2`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(insight.category)}
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {insight.category}
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {insight.prediction}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500 mb-1">Confidence</div>
                <div className="text-sm font-bold text-slate-900">{insight.confidence}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              <span>Timeline: {insight.timeframe}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}