import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { RegimePoint } from "../types";

interface Props {
  data: RegimePoint[];
}

const palette = ["#edf2f7", "#f7fafc", "#e2e8f0", "#f1f5f9", "#e5e7eb", "#f8fafc"];

export const DataRegimeView = ({ data }: Props) => {
  const ranges: Array<{ start: string; end: string; regime: number }> = [];

  data.forEach((point, idx) => {
    if (idx === 0 || point.regime !== data[idx - 1].regime) {
      ranges.push({ start: point.date, end: point.date, regime: point.regime });
    } else {
      ranges[ranges.length - 1].end = point.date;
    }
  });

  return (
    <section className="panel">
      <h2>1) Data & Regime View</h2>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#d9e2ec" strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={28} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {ranges.map((range, idx) => (
            <ReferenceArea
              key={`${range.start}-${idx}`}
              x1={range.start}
              x2={range.end}
              fill={palette[range.regime % palette.length]}
              fillOpacity={0.5}
              strokeOpacity={0}
            />
          ))}
          <Line type="monotone" dataKey="cpi_yoy" stroke="#4a5568" dot={false} name="CPI YoY %" />
          <Line type="monotone" dataKey="yield_10y" stroke="#2d3748" dot={false} name="10Y Yield %" />
          <Line type="monotone" dataKey="spx_return" stroke="#718096" dot={false} name="SPX Return %" />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
};
