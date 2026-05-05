"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { fmtShortDay } from "@/lib/format";

export interface LinePoint {
  date: string;
  value: number;
}

export function LineSeries({
  data,
  reference,
  colorVar = "#10b981",
  height = 200,
  unit = "",
}: {
  data: LinePoint[];
  reference?: number;
  colorVar?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <div style={{ width: "100%", height }} dir="ltr">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(120,120,120,0.15)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={fmtShortDay}
            tick={{ fontSize: 11 }}
            reversed
          />
          <YAxis tick={{ fontSize: 11 }} orientation="right" domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(120,120,120,0.2)" }}
            formatter={(v: number) => [`${(+v).toLocaleString("he-IL", { maximumFractionDigits: 1 })} ${unit}`, ""]}
            labelFormatter={fmtShortDay}
          />
          {reference != null ? (
            <ReferenceLine y={reference} stroke="#ef4444" strokeDasharray="4 4" />
          ) : null}
          <Line
            type="monotone"
            dataKey="value"
            stroke={colorVar}
            strokeWidth={2.4}
            dot={{ r: 3, fill: colorVar }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
