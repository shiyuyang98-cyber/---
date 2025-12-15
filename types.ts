export interface ScoreData {
  id: number;
  month: string;
  score: number;
}

export interface DistributionPoint {
  x: number;
  density: number;
  tooltipLabel?: string;
}

export interface AIAnalysisResult {
  recommendedScore: number;
  warningScore: number; // New field for warning threshold
  difficulty: string; // e.g., "Moderate", "Challenging"
  reasoning: string;
  advice: string[];
}

export interface StatisticalSummary {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
}

export interface Indicator {
  id: string;
  name: string;
  scores: ScoreData[];
  analysis?: AIAnalysisResult | null;
}
