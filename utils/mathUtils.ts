import { ScoreData, DistributionPoint, StatisticalSummary } from '../types';

export const calculateStats = (data: ScoreData[]): StatisticalSummary => {
  const values = data.map(d => d.score);
  const n = values.length;
  
  if (n === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / n;
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n; // Population variance
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    stdDev,
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

// Probability Density Function for Normal Distribution
const normalPDF = (x: number, mean: number, stdDev: number): number => {
  if (stdDev === 0) return x === mean ? 1 : 0; // Handle zero variance case
  const m = stdDev * Math.sqrt(2 * Math.PI);
  const e = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
  return e / m;
};

export const generateDistributionCurve = (
  mean: number, 
  stdDev: number, 
  targetScore: number | null
): DistributionPoint[] => {
  const points: DistributionPoint[] = [];
  
  // If no variation, return a simple spike
  if (stdDev === 0) {
    return [
      { x: mean - 10, density: 0 },
      { x: mean, density: 1 },
      { x: mean + 10, density: 0 }
    ];
  }

  // Generate range from -3.5 SD to +3.5 SD (covering 99.9% of curve)
  // Or ensure we cover the target score if it's an outlier
  const start = Math.min(mean - 3.5 * stdDev, targetScore ? targetScore - stdDev : mean - 3.5 * stdDev);
  const end = Math.max(mean + 3.5 * stdDev, targetScore ? targetScore + stdDev : mean + 3.5 * stdDev);
  const step = (end - start) / 100;

  for (let x = start; x <= end; x += step) {
    points.push({
      x: parseFloat(x.toFixed(2)),
      density: normalPDF(x, mean, stdDev),
    });
  }

  return points;
};
