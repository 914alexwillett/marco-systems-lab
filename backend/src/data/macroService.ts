import { MacroPoint } from "../types/macro";
import { fetchSeries } from "./fredClient";
import { alignSeries, computeMonthlyReturns, computeYoY } from "./transforms";

let cache: { loadedAt: number; data: MacroPoint[] } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export const loadMacroData = async (forceRefresh = false): Promise<MacroPoint[]> => {
  if (!forceRefresh && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const [cpiSeries, yieldSeries, spxSeries] = await Promise.all([
    fetchSeries("CPIAUCSL"),
    fetchSeries("DGS10"),
    fetchSeries("SP500")
  ]);

  const transformed = alignSeries(
    computeYoY(cpiSeries),
    yieldSeries,
    computeMonthlyReturns(spxSeries)
  );

  cache = {
    loadedAt: Date.now(),
    data: transformed
  };

  return transformed;
};
