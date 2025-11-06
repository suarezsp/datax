"use client";

import * as React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import type { Metric, Alert as AlertType } from "@/types";

// Utilidad para calcular variación porcentual
function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

type Props = {
  metrics?: Metric[];
  alerts?: AlertType[];
};

export function SectionCards({ metrics = [], alerts = [] }: Props) {
  // Hosts únicos
  const hosts = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of metrics) if (m.host) set.add(m.host);
    return Array.from(set);
  }, [metrics]);

  // Promedio de CPU más reciente por host
  const avgCpu = React.useMemo(() => {
    if (!metrics.length) return 0;
    const byHost = new Map<string, Metric[]>();
    for (const m of metrics) {
      const arr = byHost.get(m.host) ?? [];
      arr.push(m);
      byHost.set(m.host, arr);
    }

    const latestVals: number[] = [];
    for (const [, arr] of byHost) {
      const sorted = arr.slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
      const latest = sorted[0];
      if (typeof latest.cpu_usage === "number") latestVals.push(latest.cpu_usage);
    }

    return latestVals.length
      ? latestVals.reduce((s, v) => s + v, 0) / latestVals.length
      : 0;
  }, [metrics]);

  // Alertas abiertas / totales
  const openAlerts = React.useMemo(
    () => alerts.filter((a: any) => !(a.resolved || a.status === "Closed")).length,
    [alerts]
  );
  const totalAlerts = alerts.length;

  // Tendencia en alertas (últimos 7 días vs previos 7)
  const trend = React.useMemo(() => {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    const curStart = now - 7 * day;
    const prevStart = now - 14 * day;
    let curCount = 0,
      prevCount = 0;

    for (const a of alerts) {
      const ts = a.timestamp ? +new Date(a.timestamp) : NaN;
      if (isNaN(ts)) continue;
      if (ts >= curStart) curCount++;
      else if (ts >= prevStart && ts < curStart) prevCount++;
    }

    const pct = percentChange(curCount, prevCount);
    return { cur: curCount, prev: prevCount, pct };
  }, [alerts]);

  // KPI Cards
  const kpiItems = [
    {
      title: "Active Hosts",
      value: hosts.length,
      desc: `${hosts.length} host(s) connected.`,
      trendPct: 0,
      up: true,
      detail: "Connected systems monitored in real time",
    },
    {
      title: "Avg CPU (%)",
      value: Number(avgCpu.toFixed(1)),
      desc: "Average CPU (latest per host)",
      trendPct: 0,
      up: avgCpu >= 0,
      detail: "Average processing usage across hosts",
    },
    {
      title: "Alerts (open)",
      value: openAlerts,
      desc: `${openAlerts} open of ${totalAlerts}`,
      trendPct: Math.round(trend.pct),
      up: trend.pct >= 0,
      detail: "System alerts currently unresolved",
    },
    {
      title: "Mean of Incidents (%)",
      value: totalAlerts ? Math.round((openAlerts / totalAlerts) * 100) : 0,
      desc: "Open / total incidents ratio",
      trendPct: Math.round(trend.pct),
      up: trend.pct >= 0,
      detail: "Percentage of incidents still open",
    },
  ];

  return (
    <div
      className="
        grid 
        grid-cols-1 
        gap-4 
        px-4 
        sm:grid-cols-2 
        lg:grid-cols-4 
        *:data-[slot=card]:bg-gradient-to-t 
        *:data-[slot=card]:from-primary/5 
        *:data-[slot=card]:to-card 
        *:data-[slot=card]:shadow-xs 
        dark:*:data-[slot=card]:bg-card
        lg:px-6
      "
    >
      {kpiItems.map((k) => (
        <Card key={k.title} className="@container/card">
          <CardHeader>
            <CardDescription>{k.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {k.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {k.up ? <IconTrendingUp /> : <IconTrendingDown />}
                {k.trendPct >= 0 ? `+${k.trendPct}%` : `${k.trendPct}%`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {k.desc}{" "}
              {k.up ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{k.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}