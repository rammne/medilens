export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl?: string; // Base64 data URL for display (optional for text inputs)
  rawText: string;  // The markdown response
}

export type ViewState = 'home' | 'history' | 'result';

export interface ScanButtonProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
}