export interface MacroPoint {
  date: string;
  cpi_yoy: number;
  yield_10y: number;
  spx_return: number;
}

export interface RegimePoint extends MacroPoint {
  regime: number;
}

export interface RegimeSummary {
  regime: number;
  count: number;
  mean_spx_return: number;
  mean_cpi_yoy: number;
  mean_yield_10y: number;
}

export interface RegimeResponse {
  labeledData: RegimePoint[];
  summary: RegimeSummary[];
}

export interface HypothesisResult {
  variable: "cpi_yoy" | "yield_10y" | "spx_return";
  threshold: number;
  operator: ">" | "<" | ">=" | "<=";
  true_group: { count: number; mean_spx_return: number };
  false_group: { count: number; mean_spx_return: number };
  f_statistic: number | null;
  p_value: number | null;
}
