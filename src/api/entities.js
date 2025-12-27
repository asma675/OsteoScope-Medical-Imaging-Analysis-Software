import { apiClient } from './client';

export const XRayAnalysis = apiClient.entities.XRayAnalysis;
export const Patient = apiClient.entities.Patient;
export const AnalysisWorkflow = apiClient.entities.AnalysisWorkflow;
export const TrabekularAnalysis = apiClient.entities.TrabekularAnalysis;

export const AIAnalysis = apiClient.entities.AIAnalysis;

// auth
export const User = apiClient.auth;