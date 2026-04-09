export interface ScamAnalysisResult {
  verdict: "SCAM" | "SUSPICIOUS" | "NOT SCAM";
  confidence: number;
  scamType: string;
  explanation: string;
  redFlags: string[];
  safetyAdvice: string[];
}
