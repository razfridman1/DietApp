"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { fmtShortDay } from "@/lib/format";

export interface BarPoint {
  date: string;
  value: number;
}

export function BarSeries({
  data,
  reference,
  colorVar = "#0ea5e9",
  height = 200,
  unit = "",
}: {
  data: BarPoint[];
  reference?: number;
  colorVar?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <div style={{ width: "100%", height }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(120,120,120,0.15)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={fmtShortDay}
            tick={{ fontSize: 11 }}
            reversed
          />
          <YAxis tick={{ fontSize: 11 }} orientation="right" />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(120,120,120,0.2)" }}
            formatter={(v: number) => [`${Math.round(v).toLocaleString("he-IL")} ${unit}`, ""]}
            labelFormatter={fmtShortDay}
          />
          {reference != null ? (
            <ReferenceLine y={reference} stroke="#ef4444" strokeDasharray="4 4" />
          ) : null}
          <Bar dataKey="value" fill={colorVar} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
