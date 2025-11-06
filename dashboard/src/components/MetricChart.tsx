import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Metric } from "@/types";

interface MetricChartProps {
  data?: Metric[];
  host?: string; // "all" means all hosts
  onHostChange?: (host: string) => void; // emits "all" for all
}

export function MetricChart({ data = [], host = "all", onHostChange }: MetricChartProps) {
  const [metricType, setMetricType] = React.useState<"cpu_usage" | "memory_usage" | "latency">("cpu_usage");

  // Obtener los hosts únicos (limpio)
  const hosts = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of data) {
      if (m.host && typeof m.host === "string" && m.host.trim() !== "") set.add(m.host);
    }
    return Array.from(set);
  }, [data]);

  // Filtramos defensivamente
  const safeData = Array.isArray(data) ? data : [];
  const filteredData = React.useMemo(() => {
    return host && host !== "all" ? safeData.filter((d) => d.host === host) : safeData;
  }, [safeData, host]);

  const metricLabels: Record<typeof metricType, string> = {
    cpu_usage: "CPU Usage (%)",
    memory_usage: "Memory Usage (%)",
    latency: "Latency (ms)",
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Performance Trends</CardTitle>

        <div className="flex flex-wrap gap-2">
          {/* Selector de host: usa "all" sentinel */}
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

          {/* Selector de métrica */}
          <Select value={metricType} onValueChange={(v) => setMetricType(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpu_usage">CPU Usage</SelectItem>
              <SelectItem value="memory_usage">Memory Usage</SelectItem>
              <SelectItem value="latency">Latency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-80">
        {filteredData.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground mt-10">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={metricType}
                stroke={
                  metricType === "cpu_usage"
                    ? "#8884d8"
                    : metricType === "memory_usage"
                    ? "#82ca9d"
                    : "#ff7300"
                }
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}