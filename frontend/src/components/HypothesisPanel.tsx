import { HypothesisResult } from "../types";

interface Props {
  variable: "cpi_yoy" | "yield_10y" | "spx_return";
  operator: ">" | "<" | ">=" | "<=";
  threshold: number;
  onVariableChange: (value: "cpi_yoy" | "yield_10y" | "spx_return") => void;
  onOperatorChange: (value: ">" | "<" | ">=" | "<=") => void;
  onThresholdChange: (value: number) => void;
  result: HypothesisResult | null;
}

export const HypothesisPanel = ({
  variable,
  operator,
  threshold,
  onVariableChange,
  onOperatorChange,
  onThresholdChange,
  result
}: Props) => (
  <section className="panel">
    <h2>3) Manual Hypothesis Panel</h2>
    <div className="controls-row">
      <label>
        Variable
        <select value={variable} onChange={(e) => onVariableChange(e.target.value as Props["variable"])}>
          <option value="cpi_yoy">CPI YoY</option>
          <option value="yield_10y">10Y Yield</option>
          <option value="spx_return">SPX Return</option>
        </select>
      </label>
      <label>
        Operator
        <select value={operator} onChange={(e) => onOperatorChange(e.target.value as Props["operator"])}>
          <option value=">">&gt;</option>
          <option value=">=">&gt;=</option>
          <option value="<">&lt;</option>
          <option value="<=">&lt;=</option>
        </select>
      </label>
      <label>
        Threshold
        <input
          type="number"
          value={threshold}
          step="0.1"
          onChange={(e) => onThresholdChange(Number(e.target.value))}
        />
      </label>
    </div>

    {result && (
      <div className="hypothesis-results">
        <p>
          Condition TRUE: <strong>{result.true_group.count}</strong> samples, mean SPX return <strong>{result.true_group.mean_spx_return.toFixed(2)}%</strong>
        </p>
        <p>
          Condition FALSE: <strong>{result.false_group.count}</strong> samples, mean SPX return <strong>{result.false_group.mean_spx_return.toFixed(2)}%</strong>
        </p>
        <p>
          F-statistic: <strong>{result.f_statistic === null ? "N/A" : result.f_statistic.toFixed(3)}</strong> | p-value: <strong>{result.p_value === null ? "N/A" : result.p_value.toFixed(4)}</strong>
        </p>
      </div>
    )}
  </section>
);
