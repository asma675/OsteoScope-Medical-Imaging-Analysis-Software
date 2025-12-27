import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, MapPin } from 'lucide-react';

export default function AnomalyCard({ anomaly }) {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      minimal: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[severity.toLowerCase()] || colors.moderate;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="w-5 h-5" />;
    } else if (severity === 'moderate') {
      return <AlertCircle className="w-5 h-5" />;
    }
    return <Info className="w-5 h-5" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getSeverityColor(anomaly.severity).split(' ')[0]}`}>
              {getSeverityIcon(anomaly.severity)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-slate-900">
                {anomaly.type}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="text-sm text-slate-600">{anomaly.location}</span>
              </div>
            </div>
          </div>
          <Badge className={getSeverityColor(anomaly.severity)}>
            {anomaly.severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-slate-700 leading-relaxed">{anomaly.description}</p>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-slate-500">AI Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                style={{ width: `${anomaly.confidence}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">{anomaly.confidence}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}