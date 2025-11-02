// src/pages/dashboard/Page.tsx
"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useMetrics } from "@/hooks/useMetrics";
import { useAlerts } from "@/hooks/useAlerts";
import type { Metric } from "@/types";
import type { Alert as AlertType } from "@/types";

export default function Page(): React.JSX.Element {
  // global host; puedes hacerlo seleccionable en header si quieres
  const host = ""; // empty => all hosts
  const { data: metrics = [], isLoading: metricsLoading } = useMetrics(host);
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts();

  const hosts = React.useMemo(() => {
    const s = new Set<string>();
    for (const m of metrics) if (m.host) s.add(m.host);
    return Array.from(s);
  }, [metrics]);

  const loading = metricsLoading || alertsLoading;

  // Map alerts defensively to the DataTable schema expected
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* KPIs */}
              <SectionCards metrics={metrics as Metric[]} alerts={alerts as AlertType[]} />

              {/* Chart: le pasamos metrics y hosts para selector */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive metrics={metrics as Metric[]} hosts={hosts} host={host} />
              </div>

              {/* Data table: ahora se actualiza cuando tableData cambia */}
              <div className="px-4 lg:px-6">
                {loading ? (
                  <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm text-muted-foreground">No events to display.</p>
                  </div>
                ) : (
                  <DataTable data={tableData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
