import { useEffect, useMemo, useState } from "react";
import { getHypothesis, getMacroData, getRegimes } from "./api/client";
import { DataRegimeView } from "./components/DataRegimeView";
import { HypothesisPanel } from "./components/HypothesisPanel";
import { RegimeSummaryPanel } from "./components/RegimeSummaryPanel";
import { HypothesisResult, MacroPoint, RegimePoint, RegimeSummary } from "./types";

const App = () => {
  const [macroData, setMacroData] = useState<MacroPoint[]>([]);
  const [regimeData, setRegimeData] = useState<RegimePoint[]>([]);
  const [regimeSummary, setRegimeSummary] = useState<RegimeSummary[]>([]);
  const [k, setK] = useState(3);
  const [variable, setVariable] = useState<"cpi_yoy" | "yield_10y" | "spx_return">("cpi_yoy");
  const [operator, setOperator] = useState<">" | "<" | ">=" | "<=">(">")
  const [threshold, setThreshold] = useState(4);
  const [hypothesisResult, setHypothesisResult] = useState<HypothesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMacroData()
      .then(setMacroData)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    getRegimes(k)
      .then((response) => {
        setRegimeData(response.labeledData);
        setRegimeSummary(response.summary);
      })
      .catch((err: Error) => setError(err.message));
  }, [k]);

  useEffect(() => {
    getHypothesis(variable, threshold, operator)
      .then(setHypothesisResult)
      .catch((err: Error) => setError(err.message));
  }, [variable, threshold, operator]);

  const headlineCount = useMemo(() => regimeData.length || macroData.length, [regimeData, macroData]);

  return (
    <main className="container">
      <header>
        <h1>Macro Systems Lab</h1>
        <p className="subtitle">
          Educational prototype for macro regime analysis, non-linear relationships, and transparent hypothesis testing.
        </p>
        <div className="controls-row">
          <label>
            Regimes (K)
            <select value={k} onChange={(e) => setK(Number(e.target.value))}>
              {[2, 3, 4, 5, 6].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <span className="pill">Observations: {headlineCount}</span>
        </div>
      </header>

      {error && <p className="error">Error: {error}</p>}

      {regimeData.length > 0 && <DataRegimeView data={regimeData} />}
      {regimeSummary.length > 0 && <RegimeSummaryPanel summary={regimeSummary} />}
      <HypothesisPanel
        variable={variable}
        operator={operator}
        threshold={threshold}
        onVariableChange={setVariable}
        onOperatorChange={setOperator}
        onThresholdChange={setThreshold}
        result={hypothesisResult}
      />
    </main>
  );
};

export default App;
