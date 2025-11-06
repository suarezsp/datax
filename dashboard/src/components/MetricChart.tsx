"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Metric } from "@/types";

interface MetricChartProps {
  data?: Metric[];
  host?: string; // "all" means all hosts
  onHostChange?: (host: string) => void; // emits "all" for all
}

type MetricType = "both" | "cpu_usage" | "memory_usage" | "latency";

export function MetricChart({
  data = [],
  host = "all",
  onHostChange,
}: MetricChartProps) {
  const [metricType, setMetricType] = React.useState<MetricType>("both");

  // Unique hosts (clean)
  const hosts = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of data) {
      if (m.host && typeof m.host === "string" && m.host.trim() !== "") set.add(m.host);
    }
    return Array.from(set);
  }, [data]);

  // Defensive data shaping
  const safeData = Array.isArray(data) ? data : [];

  // Filter by host (host === "all" => all hosts)
  const filteredData = React.useMemo(() => {
    return host && host !== "all" ? safeData.filter((d) => d.host === host) : safeData;
  }, [safeData, host]);

  // Ensure timestamps are ISO strings and sorted ascending
  const chartData = React.useMemo(() => {
    return filteredData
      .slice()
      .map((d) => ({
        ...d,
        timestamp:
          typeof d.timestamp === "string" ? d.timestamp : new Date(d.timestamp).toISOString(),
      }))
      .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  }, [filteredData]);

  // Colors / gradients
  const colors = {
    cpu: "#8884d8", // purple-ish
    mem: "#82ca9d", // green-ish
    lat: "#ff7300", // orange
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Performance Trends</CardTitle>

        <div className="flex flex-wrap gap-2">
          <Select value={host || "all"} onValueChange={(v) => onHostChange?.(v === "all" ? "all" : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All hosts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All hosts</SelectItem>
              {hosts.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={metricType} onValueChange={(v) => setMetricType(v as MetricType)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">CPU & Memory</SelectItem>
              <SelectItem value="cpu_usage">CPU Usage</SelectItem>
              <SelectItem value="memory_usage">Memory Usage</SelectItem>
              <SelectItem value="latency">Latency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-80 px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-10">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              {/* Gradients */}
              <defs>
                <linearGradient id="gradCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.cpu} stopOpacity={0.85} />
                  <stop offset="95%" stopColor={colors.cpu} stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="gradMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.mem} stopOpacity={0.85} />
                  <stop offset="95%" stopColor={colors.mem} stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="gradLat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.lat} stopOpacity={0.85} />
                  <stop offset="95%" stopColor={colors.lat} stopOpacity={0.08} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickFormatter={(value) => {
                  // show time HH:MM
                  const d = new Date(value);
                  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                }}
              />
              <YAxis tick={{ fontSize: 12 }} width={56} />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Legend />

              {/* Render según selección */}
              {/* CPU & Memory (stacked for visual comparison) */}
              {(metricType === "both" || metricType === "memory_usage") && (
                <Area
                  type="natural"
                  dataKey="memory_usage"
                  name="Memory (%)"
                  fill="url(#gradMem)"
                  stroke={colors.mem}
                  fillOpacity={1}
                  stackId={metricType === "both" ? "a" : undefined}
                  isAnimationActive={false}
                  dot={false}
                />
              )}

              {(metricType === "both" || metricType === "cpu_usage") && (
                <Area
                  type="natural"
                  dataKey="cpu_usage"
                  name="CPU (%)"
                  fill="url(#gradCpu)"
                  stroke={colors.cpu}
                  fillOpacity={1}
                  stackId={metricType === "both" ? "a" : undefined}
                  isAnimationActive={false}
                  dot={false}
                />
              )}

              {/* Latency (drawn separately so scale/visual don't confuse CPU/Mem) */}
              {metricType === "latency" && (
                <Area
                  type="monotone"
                  dataKey="latency"
                  name="Latency (ms)"
                  fill="url(#gradLat)"
                  stroke={colors.lat}
                  fillOpacity={1}
                  isAnimationActive={false}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}