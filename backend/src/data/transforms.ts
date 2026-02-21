import { MacroPoint } from "../types/macro";
import { FredObservation } from "./fredClient";

interface MonthlyValue {
  date: string;
  value: number;
}

const parseObservation = (observation: FredObservation): MonthlyValue | null => {
  const value = Number(observation.value);
  if (Number.isNaN(value)) {
    return null;
  }

  return {
    date: observation.date,
    value
  };
};

const mapValidObservations = (series: FredObservation[]): MonthlyValue[] =>
  series.map(parseObservation).filter((item): item is MonthlyValue => item !== null);

export const computeYoY = (series: FredObservation[]): MonthlyValue[] => {
  const clean = mapValidObservations(series);

  return clean
    .map((point, index) => {
      const prev = clean[index - 12];
      if (!prev || prev.value === 0) {
        return null;
      }

      return {
        date: point.date,
        value: ((point.value / prev.value) - 1) * 100
      };
    })
    .filter((item): item is MonthlyValue => item !== null);
};

export const computeMonthlyReturns = (
  series: FredObservation[]
): MonthlyValue[] => {
  const clean = mapValidObservations(series);

  return clean
    .map((point, index) => {
      const prev = clean[index - 1];
      if (!prev || prev.value === 0) {
        return null;
      }

      return {
        date: point.date,
        value: ((point.value / prev.value) - 1) * 100
      };
    })
    .filter((item): item is MonthlyValue => item !== null);
};

export const alignSeries = (
  cpiYoY: MonthlyValue[],
  tenYearYield: FredObservation[],
  spxReturns: MonthlyValue[]
): MacroPoint[] => {
  const yieldMap = new Map(
    tenYearYield
      .map(parseObservation)
      .filter((item): item is MonthlyValue => item !== null)
      .map((item) => [item.date, item.value])
  );
  const cpiMap = new Map(cpiYoY.map((item) => [item.date, item.value]));
  const spxMap = new Map(spxReturns.map((item) => [item.date, item.value]));

  return Array.from(cpiMap.keys())
    .filter((date) => yieldMap.has(date) && spxMap.has(date))
    .map((date) => ({
      date,
      cpi_yoy: cpiMap.get(date) as number,
      yield_10y: yieldMap.get(date) as number,
      spx_return: spxMap.get(date) as number
    }))
    .filter(
      (point) =>
        Number.isFinite(point.cpi_yoy) &&
        Number.isFinite(point.yield_10y) &&
        Number.isFinite(point.spx_return)
    )
    .sort((a, b) => a.date.localeCompare(b.date));
};
