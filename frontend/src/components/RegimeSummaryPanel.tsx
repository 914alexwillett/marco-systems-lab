import { RegimeSummary } from "../types";

interface Props {
  summary: RegimeSummary[];
}

export const RegimeSummaryPanel = ({ summary }: Props) => (
  <section className="panel">
    <h2>2) Regime Summary Panel</h2>
    <table>
      <thead>
        <tr>
          <th>Regime ID</th>
          <th>Mean SPX Return (%)</th>
          <th>Count</th>
          <th>Mean CPI YoY (%)</th>
          <th>Mean 10Y Yield (%)</th>
        </tr>
      </thead>
      <tbody>
        {summary.map((row) => (
          <tr key={row.regime}>
            <td>{row.regime}</td>
            <td>{row.mean_spx_return.toFixed(2)}</td>
            <td>{row.count}</td>
            <td>{row.mean_cpi_yoy.toFixed(2)}</td>
            <td>{row.mean_yield_10y.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);
