"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MetricChart } from "@/components/MetricChart";

import { useMetrics } from "@/hooks/useMetrics";
import { useAlerts } from "@/hooks/useAlerts";
import type { Metric, Alert as AlertType } from "@/types";

export default function Page(): React.JSX.Element {
  const [selectedHost, setSelectedHost] = React.useState<string>("all");

  const hostForBackend = selectedHost === "all" ? "" : selectedHost;
  const { data: metrics = [], isLoading: metricsLoading } = useMetrics(hostForBackend);
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts();

  // list of host to send to Chart
  const hosts = React.useMemo(() => {
    const s = new Set<string>();
    for (const m of metrics) if (m.host) s.add(m.host);
    return Array.from(s);
  }, [metrics]);

  const loading = metricsLoading || alertsLoading;

  function mapAlertsToTableData(alertsArr: AlertType[] | undefined) {
    if (!alertsArr || alertsArr.length === 0) return [];
    return alertsArr.map((a, idx) => {
      const id = (a as any).id ?? idx + 1;
      const header = (a as any).title ?? (a as any).message ?? `Alert ${id}`;
      const type = (a as any).type ?? (a as any).severity ?? "Alert";
      const status = (a as any).status ?? ((a as any).resolved ? "Closed" : "Open");
      const target = (a as any).host ?? "unknown";
      const limit = (a as any).threshold ? String((a as any).threshold) : (a as any).limit ?? "—";
      const reviewer = (a as any).owner ?? (a as any).reviewer ?? "system";
      return { id, header, type, status, target, limit, reviewer };
    });
  }

  const tableData = React.useMemo(() => mapAlertsToTableData(alerts), [alerts]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-col gap-6 p-4 lg:p-8">
          {loading ? (
            <div className="text-muted-foreground text-center py-20">Loading metrics and alerts...</div>
          ) : (
            <>
              {/* KPIs */}
              <SectionCards metrics={metrics} alerts={alerts} />


              {/* to select type of metric */}
              <MetricChart
                data={metrics}
                host={selectedHost}
                onHostChange={(h) => setSelectedHost(h ?? "all")}
              />

              {/* alerts table */}
              <DataTable data={tableData} />
            </>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}