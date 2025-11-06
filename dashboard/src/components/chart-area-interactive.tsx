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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import type { Metric } from "@/types";

type Props = {
  metrics?: Metric[];
  host?: string;
  hosts?: string[]; // optional hosts list to populate selector
  onHostChange?: (host: string) => void; // "all" means all hosts
};

const chartCfg: ChartConfig = {
  cpu: { label: "CPU (%)", color: "var(--color-desktop)" },
  memory: { label: "Memory (%)", color: "var(--color-memory)" },
};

export function ChartAreaInteractive({
  metrics = [],
  host,
  hosts = [],
  onHostChange,
}: Props) {
  const isMobile = useIsMobile();

  // mode state: union literal
  const [mode, setMode] = React.useState<"live" | "7d" | "1m">("live");

  // Build host list (unique) from provided `hosts` prop or from metrics
  const hostList = React.useMemo(() => {
    const base = Array.isArray(hosts) && hosts.length ? hosts : (Array.isArray(metrics) ? metrics.map(m => m.host) : []);
    const s = new Set<string>();
    for (const h of base) {
      if (h && typeof h === "string" && h.trim() !== "") {
        s.add(h);
      }
    }
    return Array.from(s);
  }, [hosts, metrics]);

  // internal selection uses the sentinel "all" (never empty string)
  const initialHostInternal = host && host.trim() !== "" ? host : (hostList[0] ?? "all");
  const [selectedHostInternal, setSelectedHostInternal] = React.useState<string>(initialHostInternal);

  React.useEffect(() => {
    // sync parent -> internal ("all" means all)
    if (host && host.trim() !== "" && host !== selectedHostInternal) {
      setSelectedHostInternal(host);
    } else if ((!host || host === "") && selectedHostInternal !== "all") {
      // parent cleared (''), make internal "all"
      setSelectedHostInternal("all");
    }
  }, [host, selectedHostInternal]);

  // Convert internal selection into a filter string for metrics ('all' -> include all)
  const effectiveSelectedHost = selectedHostInternal === "all" ? "" : selectedHostInternal;

  // Safe metrics array
  const safeMetrics = Array.isArray(metrics) ? metrics : [];

  // Build chart data
  const chartData = React.useMemo(() => {
    // apply host filter
    const filtered = effectiveSelectedHost ? safeMetrics.filter((m) => m.host === effectiveSelectedHost) : safeMetrics.slice();

    if (mode === "live") {
      // last 5 minutes window, keep up to 60 points
      const now = Date.now();
      const fiveMin = 1000 * 60 * 5;
      const recent = filtered.filter((m) => +new Date(m.timestamp) >= now - fiveMin);
      const points = recent
        .slice()
        .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
        .slice(-60)
        .map((m) => ({
          date: m.timestamp,
          cpu: m.cpu_usage ?? 0,
          memory: m.memory_usage ?? 0,
        }));
      return points.length ? points : [{ date: new Date().toISOString(), cpu: 0, memory: 0 }];
    }

    // 7d or 1m: aggregate by day
    const windowDays = mode === "7d" ? 7 : 30;
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - windowDays);

    const map = new Map<string, { cpuSum: number; memSum: number; count: number }>();
    for (const m of filtered) {
      const ts = new Date(m.timestamp);
      if (ts < start) continue;
      const dateKey = ts.toISOString().slice(0, 10);
      const e = map.get(dateKey) ?? { cpuSum: 0, memSum: 0, count: 0 };
      e.cpuSum += m.cpu_usage ?? 0;
      e.memSum += m.memory_usage ?? 0;
      e.count += 1;
      map.set(dateKey, e);
    }

    const arr = Array.from(map.entries())
      .map(([date, { cpuSum, memSum, count }]) => ({
        date,
        cpu: count ? +(cpuSum / count).toFixed(2) : 0,
        memory: count ? +(memSum / count).toFixed(2) : 0,
      }))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));

    return arr.length ? arr : [{ date: new Date().toISOString().slice(0, 10), cpu: 0, memory: 0 }];
  }, [safeMetrics, mode, effectiveSelectedHost]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Live Metrics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Real-time + historical overview</span>
          <span className="@[540px]/card:hidden">Live / 7d / 1m</span>
        </CardDescription>

        <CardAction>
          {/* Desktop toggle */}
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

          {/* Mobile select for mode */}
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

          {/* Host selector: uses sentinel "all" (never empty string) */}
          {hostList && hostList.length > 0 ? (
            <Select
              value={selectedHostInternal}
              onValueChange={(v) => {
                setSelectedHostInternal(v);
                onHostChange?.(v === "all" ? "" : v);
              }}
            >
              <SelectTrigger className="ml-2 hidden md:flex w-48" size="sm">
                <SelectValue placeholder="Select host" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hosts</SelectItem>
                {hostList.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="ml-2 hidden md:flex items-center text-muted-foreground text-sm">
              No hosts
            </div>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartCfg} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-memory)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-memory)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}