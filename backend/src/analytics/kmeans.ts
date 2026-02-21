import { MacroPoint, RegimePoint, RegimeSummary } from "../types/macro";
import { mean, round, standardDeviation } from "../utils/math";

interface StandardizedPoint {
  date: string;
  original: MacroPoint;
  features: [number, number, number];
}

const euclideanDistance = (a: number[], b: number[]): number =>
  Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));

const standardize = (data: MacroPoint[]): StandardizedPoint[] => {
  const cpi = data.map((d) => d.cpi_yoy);
  const yld = data.map((d) => d.yield_10y);
  const ret = data.map((d) => d.spx_return);

  const cpiMean = mean(cpi);
  const yldMean = mean(yld);
  const retMean = mean(ret);

  const cpiStd = standardDeviation(cpi) || 1;
  const yldStd = standardDeviation(yld) || 1;
  const retStd = standardDeviation(ret) || 1;

  return data.map((point) => ({
    date: point.date,
    original: point,
    features: [
      (point.cpi_yoy - cpiMean) / cpiStd,
      (point.yield_10y - yldMean) / yldStd,
      (point.spx_return - retMean) / retStd
    ]
  }));
};

const initializeCentroids = (data: StandardizedPoint[], k: number): number[][] => {
  const step = Math.max(1, Math.floor(data.length / k));
  return Array.from({ length: k }, (_, idx) => data[Math.min(idx * step, data.length - 1)].features.slice());
};

export const runKMeans = (
  data: MacroPoint[],
  k: number,
  maxIterations = 50
): { labeledData: RegimePoint[]; summary: RegimeSummary[] } => {
  if (k < 2 || k > 6) {
    throw new Error("K must be between 2 and 6.");
  }

  if (data.length < k) {
    throw new Error("Not enough data points for selected K.");
  }

  const standardized = standardize(data);
  let centroids = initializeCentroids(standardized, k);
  let assignments = new Array<number>(standardized.length).fill(0);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const newAssignments = standardized.map((point) => {
      let closest = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      centroids.forEach((centroid, index) => {
        const distance = euclideanDistance(point.features, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });

      return closest;
    });

    const hasChanged = newAssignments.some((assignment, idx) => assignment !== assignments[idx]);
    assignments = newAssignments;

    const nextCentroids = Array.from({ length: k }, (_, regimeId) => {
      const cluster = standardized.filter((_, idx) => assignments[idx] === regimeId);
      if (cluster.length === 0) {
        return centroids[regimeId];
      }

      return [0, 1, 2].map((featureIdx) => mean(cluster.map((point) => point.features[featureIdx])));
    });

    centroids = nextCentroids;

    if (!hasChanged) {
      break;
    }
  }

  const labeledData: RegimePoint[] = standardized.map((point, idx) => ({
    ...point.original,
    regime: assignments[idx]
  }));

  const summary: RegimeSummary[] = Array.from({ length: k }, (_, regimeId) => {
    const cluster = labeledData.filter((point) => point.regime === regimeId);
    const count = cluster.length;

    return {
      regime: regimeId,
      count,
      mean_spx_return: count ? round(mean(cluster.map((point) => point.spx_return))) : 0,
      mean_cpi_yoy: count ? round(mean(cluster.map((point) => point.cpi_yoy))) : 0,
      mean_yield_10y: count ? round(mean(cluster.map((point) => point.yield_10y))) : 0
    };
  });

  return { labeledData, summary };
};
