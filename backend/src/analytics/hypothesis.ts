import { HypothesisResult, MacroPoint, MacroVariable } from "../types/macro";
import { mean, round } from "../utils/math";

type Operator = ">" | "<" | ">=" | "<=";

const compare = (value: number, threshold: number, operator: Operator): boolean => {
  switch (operator) {
    case ">":
      return value > threshold;
    case "<":
      return value < threshold;
    case ">=":
      return value >= threshold;
    case "<=":
      return value <= threshold;
    default:
      return false;
  }
};

const gammaln = (x: number): number => {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  cof.forEach((c) => {
    y += 1;
    ser += c / y;
  });
  return -tmp + Math.log(2.5066282746310005 * ser / x);
};

const betacf = (x: number, a: number, b: number): number => {
  const maxIterations = 200;
  const epsilon = 3e-7;
  const fpmin = 1e-30;

  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIterations; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < epsilon) {
      break;
    }
  }

  return h;
};

const betainc = (x: number, a: number, b: number): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const bt = Math.exp(
    gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)
  );

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(x, a, b)) / a;
  }

  return 1 - (bt * betacf(1 - x, b, a)) / b;
};

const fSurvivalPValue = (fStatistic: number, d1: number, d2: number): number => {
  if (fStatistic <= 0 || d1 <= 0 || d2 <= 0) {
    return 1;
  }

  const x = (d1 * fStatistic) / (d1 * fStatistic + d2);
  const cdf = betainc(x, d1 / 2, d2 / 2);
  return Math.max(0, Math.min(1, 1 - cdf));
};

export const runConditionalMeanTest = (
  data: MacroPoint[],
  variable: MacroVariable,
  threshold: number,
  operator: Operator
): HypothesisResult => {
  const trueGroup = data.filter((point) => compare(point[variable], threshold, operator));
  const falseGroup = data.filter((point) => !compare(point[variable], threshold, operator));

  const trueReturns = trueGroup.map((point) => point.spx_return);
  const falseReturns = falseGroup.map((point) => point.spx_return);

  const trueMean = trueReturns.length ? mean(trueReturns) : 0;
  const falseMean = falseReturns.length ? mean(falseReturns) : 0;

  let fStatistic: number | null = null;
  let pValue: number | null = null;

  if (trueReturns.length > 1 && falseReturns.length > 1) {
    const all = [...trueReturns, ...falseReturns];
    const grandMean = mean(all);

    const ssBetween =
      trueReturns.length * (trueMean - grandMean) ** 2 +
      falseReturns.length * (falseMean - grandMean) ** 2;

    const ssWithin =
      trueReturns.reduce((sum, value) => sum + (value - trueMean) ** 2, 0) +
      falseReturns.reduce((sum, value) => sum + (value - falseMean) ** 2, 0);

    const dfBetween = 1;
    const dfWithin = all.length - 2;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;

    if (msWithin > 0) {
      fStatistic = msBetween / msWithin;
      pValue = fSurvivalPValue(fStatistic, dfBetween, dfWithin);
    }
  }

  return {
    variable,
    threshold,
    operator,
    true_group: {
      count: trueGroup.length,
      mean_spx_return: round(trueMean)
    },
    false_group: {
      count: falseGroup.length,
      mean_spx_return: round(falseMean)
    },
    f_statistic: fStatistic === null ? null : round(fStatistic),
    p_value: pValue === null ? null : round(pValue)
  };
};
