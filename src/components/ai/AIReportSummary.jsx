import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function AIReportSummary({ analysis }) {
  const handleDownloadReport = () => {
    // Future: Implement PDF generation
    alert('Report download feature coming soon!');
  };

  const handleShareReport = () => {
    // Future: Implement sharing functionality
    alert('Report sharing feature coming soon!');
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <CardTitle>AI Analysis Report</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareReport}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Info */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Patient:</span>
            <span className="text-sm font-semibold text-slate-900">{analysis.patient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Analysis Date:</span>
            <span className="text-sm font-semibold text-slate-900">
              {analysis.analysis_timestamp ? format(new Date(analysis.analysis_timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Processing Time:</span>
            <span className="text-sm font-semibold text-slate-900">
              {analysis.processing_time_seconds ? `${analysis.processing_time_seconds}s` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Executive Summary</h3>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis.report_summary}
            </p>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4">
          <span className="text-sm text-slate-600">AI Confidence Score:</span>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                style={{ width: `${analysis.ai_confidence_score || 0}%` }}
              />
            </div>
            <Badge variant="outline" className="font-semibold">
              {analysis.ai_confidence_score || 0}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}