import { HypothesisResult, MacroPoint, RegimeResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const getMacroData = (): Promise<MacroPoint[]> => fetchJson<MacroPoint[]>("/macro");

export const getRegimes = (k: number): Promise<RegimeResponse> =>
  fetchJson<RegimeResponse>(`/regimes?k=${k}`);

export const getHypothesis = (
  variable: string,
  threshold: number,
  operator: string
): Promise<HypothesisResult> =>
  fetchJson<HypothesisResult>(
    `/hypothesis?variable=${variable}&threshold=${threshold}&operator=${encodeURIComponent(operator)}`
  );
