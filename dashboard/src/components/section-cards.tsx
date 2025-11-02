// src/components/section-cards.tsx
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

import type { Metric } from "@/types";
import type { Alert as AlertType } from "@/types";

type Props = {
  metrics?: Metric[];
  alerts?: AlertType[];
};

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}


export function SectionCards({ metrics = [], alerts = [] }: Props) {
  // derive hosts and counts
  const hosts = React.useMemo(() => {
    const set = new Set<string>();
    for (const m of metrics) {
      if (m.host) set.add(m.host);
    }
    return Array.from(set);
  }, [metrics]);

  // Average latest CPU per host (take latest metric for each host then avg)
  const avgCpu = React.useMemo(() => {
    if (!metrics.length) return 0;
    const byHost = new Map<string, Metric[]>();
    for (const m of metrics) {
      const arr = byHost.get(m.host) ?? [];
      arr.push(m);
      byHost.set(m.host, arr);
    }
    const latestVals: number[] = [];
    for (const [host, arr] of byHost) {
      const sorted = arr.slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
      const latest = sorted[0];
      if (typeof latest.cpu_usage === "number") latestVals.push(latest.cpu_usage);
    }
    if (!latestVals.length) return 0;
    return latestVals.reduce((s, v) => s + v, 0) / latestVals.length;
  }, [metrics]);

  // Alerts counts
  const openAlerts = React.useMemo(() => alerts.filter((a: any) => !(a.resolved || a.status === "Closed")).length, [alerts]);
  const totalAlerts = alerts.length;

  // Trend calculation: compare last 7 days with previous 7-day window
  const trend = React.useMemo(() => {
    // helper to sum by window
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    const curStart = now - 7 * day;
    const prevStart = now - 14 * day;
    let curCount = 0, prevCount = 0;

    for (const a of alerts) {
      const ts = a.timestamp ? +new Date(a.timestamp) : NaN;
      if (isNaN(ts)) continue;
      if (ts >= curStart) curCount++;
      else if (ts >= prevStart && ts < curStart) prevCount++;
    }

    const pct = percentChange(curCount, prevCount);
    return { cur: curCount, prev: prevCount, pct };
  }, [alerts]);

  // Prepare display values
  const kpiItems = [
    {
      title: "Active Hosts",
      value: hosts.length,
      desc: `${hosts.length} host(s) connected.`,
      trendPct: 0,
      up: true,
    },
    {
      title: "Avg CPU (%)",
      value: Number(avgCpu.toFixed(1)),
      desc: `Average CPU (last per host)`,
      trendPct: 0,
      up: avgCpu >= 0,
    },
    {
      title: "Alerts (open)",
      value: openAlerts,
      desc: `${openAlerts} open of ${totalAlerts}`,
      trendPct: Math.round(trend.pct),
      up: trend.pct >= 0,
    },
    {
      title: "Mean of incidents",
      value: totalAlerts ? Math.round((openAlerts / totalAlerts) * 100) : 0,
      desc: `Open / total (%)`,
      trendPct: Math.round(trend.pct),
      up: trend.pct <= 0 ? false : true,
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {kpiItems.map((k) => (
        <Card key={k.title} className="@container/card">
          <CardHeader>
            <CardDescription>{k.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {k.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="flex items-center gap-2">
                {k.up ? <IconTrendingUp /> : <IconTrendingDown />}
                {k.trendPct >= 0 ? `+${k.trendPct}%` : `${k.trendPct}%`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{k.desc}</div>
            <div className="text-muted-foreground">Last update: now</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
