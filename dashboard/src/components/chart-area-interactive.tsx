"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Metric } from "@/types";

type Props = {
  metrics?: Metric[];
  host?: string; // "all" means all hosts
  hosts?: string[]; // optional hosts list to populate selector
  onHostChange?: (host: string) => void;
};

const chartConfig: ChartConfig = {
  cpu: { label: "CPU (%)", color: "var(--color-desktop)" },
  memory: { label: "Memory (%)", color: "var(--color-memory)" },
};

function parseTimestamp(ts: any): number | null {
  if (ts == null) return null;
  if (typeof ts === "number" && Number.isFinite(ts)) return ts;
  if (typeof ts === "string") {
    const n = Date.parse(ts);
    if (!isNaN(n)) return n;
    const f = parseFloat(ts);
    if (!isNaN(f)) return f;
  }
  if (ts instanceof Date && !isNaN(ts.getTime())) return ts.getTime();
  return null;
}

export function ChartAreaInteractive({ metrics = [], host, hosts = [], onHostChange }: Props) {
  const isMobile = useIsMobile();

  // mode: live, 7d, 1m (1 month)
  const [mode, setMode] = React.useState<"live" | "7d" | "1m">("live");

  // build host list from props or metrics
  const hostList = React.useMemo(() => {
    const base = Array.isArray(hosts) && hosts.length ? hosts : (Array.isArray(metrics) ? metrics.map(m => m.host) : []);
    const s = new Set<string>();
    for (const h of base) {
      if (h && typeof h === "string" && h.trim() !== "") s.add(h);
    }
    return Array.from(s);
  }, [hosts, metrics]);

  // internal host sentinel = "all"
  const initialHost = host && host.trim() !== "" ? host : (hostList[0] ?? "all");
  const [selectedHost, setSelectedHost] = React.useState<string>(initialHost);

  React.useEffect(() => {
    if (host && host.trim() !== "" && host !== selectedHost) setSelectedHost(host);
    else if ((!host || host === "") && selectedHost !== "all") setSelectedHost("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host]);

  // effective host filter string for backend logic: '' means all
  const effectiveHostFilter = selectedHost === "all" ? "" : selectedHost;

  // normalize metrics defensively
  const normalized = React.useMemo(() => {
    if (!Array.isArray(metrics)) return [];
    const out: Array<{ ts: number; cpu: number; memory: number; host?: string }> = [];
    for (const m of metrics) {
      const ts = parseTimestamp((m as any).timestamp ?? (m as any).time ?? (m as any).created_at);
      if (ts === null) continue;
      const cpu = Number((m as any).cpu_usage ?? (m as any).cpu ?? NaN);
      const memory = Number((m as any).memory_usage ?? (m as any).memory ?? NaN);
      if (!Number.isFinite(cpu) || !Number.isFinite(memory)) continue;
      out.push({ ts, cpu, memory, host: (m as any).host });
    }
    return out;
  }, [metrics]);

  // Build chart data depending on mode
  const chartData = React.useMemo(() => {
    // filter by host
    const filtered = effectiveHostFilter ? normalized.filter(n => n.host === effectiveHostFilter) : normalized.slice();

    if (mode === "live") {
      // last 5 minutes window, aggregate per second to avoid duplicate timestamps
      const now = Date.now();
      const windowMs = 1000 * 60 * 5;
      const start = now - windowMs;
      const recent = filtered.filter(p => p.ts >= start);
      if (!recent.length) return [];

      const buckets = new Map<number, { cpuSum: number; memSum: number; count: number }>();
      for (const p of recent) {
        const key = Math.floor(p.ts / 1000) * 1000; // second granularity
        const v = buckets.get(key) ?? { cpuSum: 0, memSum: 0, count: 0 };
        v.cpuSum += p.cpu;
        v.memSum += p.memory;
        v.count += 1;
        buckets.set(key, v);
      }

      const arr = Array.from(buckets.entries())
        .map(([ts, { cpuSum, memSum, count }]) => ({
          date: new Date(ts).toISOString(),
          cpu: +(cpuSum / count).toFixed(2),
          memory: +(memSum / count).toFixed(2),
        }))
        .sort((a, b) => +new Date(a.date) - +new Date(b.date))
        .slice(-60);

      return arr;
    }

    // 7d or 1m: aggregate by day
    const days = mode === "7d" ? 7 : 30;
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    const map = new Map<string, { cpuSum: number; memSum: number; count: number }>();
    for (const p of filtered) {
      const d = new Date(p.ts);
      if (d < start) continue;
      const key = d.toISOString().slice(0, 10);
      const val = map.get(key) ?? { cpuSum: 0, memSum: 0, count: 0 };
      val.cpuSum += p.cpu;
      val.memSum += p.memory;
      val.count += 1;
      map.set(key, val);
    }

    const arr = Array.from(map.entries())
      .map(([date, { cpuSum, memSum, count }]) => ({
        date,
        cpu: count ? +(cpuSum / count).toFixed(2) : 0,
        memory: count ? +(memSum / count).toFixed(2) : 0,
      }))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));

    return arr.length ? arr : [];
  }, [normalized, mode, effectiveHostFilter]);

  const hasData = chartData.length > 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Live Metrics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Real-time + historical overview</span>
          <span className="@[540px]/card:hidden">Live / 7d / 1m</span>
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as "live" | "7d" | "1m")}
            variant="outline"
            className="hidden @[767px]/card:flex *:data-[slot=toggle-group-item]:!px-4"
          >
            <ToggleGroupItem value="live">Live</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
            <ToggleGroupItem value="1m">1 month</ToggleGroupItem>
          </ToggleGroup>

          {/* mobile select */}
          <Select value={mode} onValueChange={(v) => setMode(v as "live" | "7d" | "1m")}>
            <SelectTrigger className="flex w-40 md:hidden" size="sm">
              <SelectValue placeholder="Live" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="1m">Last 1 month</SelectItem>
            </SelectContent>
          </Select>

          {/* host selector */}
          {hostList && hostList.length > 0 ? (
            <Select
              value={selectedHost}
              onValueChange={(v) => {
                setSelectedHost(v);
                onHostChange?.(v === "all" ? "" : v);
              }}
            >
              <SelectTrigger className="ml-2 hidden md:flex w-48" size="sm">
                <SelectValue placeholder="Select host" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hosts</SelectItem>
                {hostList.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="ml-2 hidden md:flex items-center text-muted-foreground text-sm">No hosts</div>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          {!hasData ? (
            <div className="text-center text-sm text-muted-foreground mt-8">
              {mode === "live"
                ? "No recent metrics in the last 5 minutes. Ensure the generator is running and the backend route returns data."
                : "No data for the selected range."}
            </div>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="fillMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-memory)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--color-memory)" stopOpacity={0.08} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return mode === "live"
                    ? d.toLocaleTimeString()
                    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area dataKey="memory" type="natural" fill="url(#fillMem)" stroke="var(--color-memory)" stackId="a" />
              <Area dataKey="cpu" type="natural" fill="url(#fillCpu)" stroke="var(--color-desktop)" stackId="a" />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}