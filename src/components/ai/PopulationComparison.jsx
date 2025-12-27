import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';

export default function PopulationComparison({ comparison }) {
  if (!comparison) {
    return null;
  }

  const getPercentileColor = (percentile) => {
    if (percentile >= 75) return 'text-green-600';
    if (percentile >= 50) return 'text-blue-600';
    if (percentile >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-600" />
          <span>Population Comparison</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className={`text-6xl font-bold ${getPercentileColor(comparison.percentile)}`}>
              {comparison.percentile}
              <span className="text-3xl align-super">th</span>
            </div>
            <div className="text-sm text-slate-600 mt-1">Percentile</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-blue-500 to-green-500 relative"
            >
              <div 
                className="absolute top-0 h-full w-1 bg-slate-900"
                style={{ left: `${comparison.percentile}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Age Group:</span>
            <span className="font-semibold text-slate-900">{comparison.age_group}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
            {comparison.interpretation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}