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
  LabelList,
} from "recharts";
import { fmtShortDay } from "@/lib/format";

export interface BarPoint {
  date: string;
  value: number;
  /** When true, a small "activity" indicator dot is drawn above the bar. */
  hasActivity?: boolean;
}

export function BarSeries({
  data,
  reference,
  colorVar = "#0ea5e9",
  height = 200,
  unit = "",
  onBarClick,
  activityColor = "#10b981",
}: {
  data: BarPoint[];
  reference?: number;
  colorVar?: string;
  height?: number;
  unit?: string;
  /** If supplied, bars become tappable and call this with the bar's date. */
  onBarClick?: (date: string) => void;
  activityColor?: string;
}) {
  const clickable = !!onBarClick;

  // Render an activity indicator above bars whose data has hasActivity = true.
  // recharts LabelList passes us the SVG-positioned x/y/width for each bar,
  // so we draw a small filled circle just above the bar.
  function ActivityDot(props: any) {
    const { x, y, width, value, index } = props;
    const point = data[index];
    if (!point?.hasActivity) return null;
    const cx = Number(x) + Number(width) / 2;
    const cy = Math.max(6, Number(y) - 6);
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={activityColor} stroke="#fff" strokeWidth={1.5} />
      </g>
    );
  }

  return (
    <div style={{ width: "100%", height }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
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
          <Bar
            dataKey="value"
            fill={colorVar}
            radius={[6, 6, 0, 0]}
            cursor={clickable ? "pointer" : "default"}
            onClick={clickable ? (d: any) => onBarClick!(d?.date ?? d?.payload?.date) : undefined}
          >
            <LabelList dataKey="value" content={ActivityDot as any} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
