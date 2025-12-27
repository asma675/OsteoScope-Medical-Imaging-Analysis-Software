import { apiClient } from './client';

// Keep the existing import path stable for the rest of the app.
export const UploadFile = apiClient.integrations.UploadFile;
export const SendEmail = apiClient.integrations.SendEmail;
export const InvokeLLM = apiClient.integrations.InvokeLLM;
