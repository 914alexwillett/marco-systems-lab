export const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

export const variance = (values: number[]): number => {
  if (values.length < 2) {
    return 0;
  }

  const mu = mean(values);
  return (
    values.reduce((sum, value) => sum + (value - mu) ** 2, 0) /
    (values.length - 1)
  );
};

export const standardDeviation = (values: number[]): number =>
  Math.sqrt(variance(values));

export const round = (value: number, digits = 4): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
