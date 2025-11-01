"use client";

import React, { useState } from "react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { DataTable } from "@/components/data-table";

import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricChart } from "@/components/MetricChart";
import { AlertsPanel } from "@/components/AlertsPanel";

import { useMetrics } from "@/hooks/useMetrics";
import { useAlerts } from "@/hooks/useAlerts";
import type { Metric, Alert } from "@/types";

/**
 * DashboardPage
 *
 * - Usa el layout original de shadcn (sidebar + inset)
 * - Envuelve todo en SidebarProvider (necesario para AppSidebar)
 * - Integra nuestros componentes personalizados (KPI, métricas, alertas)
 */
export default function DashboardPage(): React.JSX.Element {
  const [host, setHost] = useState<string>("server01");

  const { data: metrics = [], isLoading: metricsLoading } = useMetrics(host);
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts();

  const loading = metricsLoading || alertsLoading;
  const hasData = metrics.length > 0 || alerts.length > 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <NavMain
                    items={[
                        { title: "Dashboard", url: "/dashboard" },
                        { title: "Metrics", url: "/metrics" },
                        { title: "Alerts", url: "/alerts" },
                        { title: "Settings", url: "/settings" },
                    ]}
                    />
                    <NavUser
                    user={{
                        name: "Admin User",
                        email: "admin@example.com",
                        avatar: "https://avatars.githubusercontent.com/u/1?v=4",
                    }}
                    />
                </div>
            </header>


        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-7xl">
            <DashboardHeader
              metrics={metrics as Metric[]}
              alerts={alerts as Alert[]}
              onHostChange={(h: string) => setHost(h)}
            />

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                {metricsLoading ? (
                  <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      Loading metrics...
                    </p>
                  </div>
                ) : metrics.length === 0 ? (
                  <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      No metrics available for this host.
                    </p>
                  </div>
                ) : (
                  <MetricChart data={metrics as Metric[]} />
                )}
              </div>

              <div>
                {alertsLoading ? (
                  <div className="rounded-lg border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      Loading alerts...
                    </p>
                  </div>
                ) : (
                  <AlertsPanel alerts={alerts as Alert[]} />
                )}
              </div>
            </div>

            <section className="mt-8">
              <div className="grid gap-6">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-4 text-lg font-semibold">
                    Recent Events & Hosts
                  </h3>
                  {DataTable ? (
                    <DataTable
                      data={[
                        {
                          id: 1,
                          header: "CPU Usage Alert",
                          type: "Performance",
                          status: "Open",
                          target: "server01",
                          limit: "85%",
                          reviewer: "system",
                        },
                        {
                          id: 2,
                          header: "Memory Threshold",
                          type: "System",
                          status: "Closed",
                          target: "server02",
                          limit: "90%",
                          reviewer: "system",
                        },
                      ]}
                    />
                  ) : !hasData ? (
                    <p className="text-sm text-muted-foreground">
                      No events or hosts to display.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground">
                            <th className="py-2">Host</th>
                            <th className="py-2">CPU %</th>
                            <th className="py-2">Memory %</th>
                            <th className="py-2">Latency (ms)</th>
                            <th className="py-2">Last seen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupLatestByHost(metrics as Metric[]).map((row) => (
                            <tr key={row.host} className="border-t">
                              <td className="py-3">{row.host}</td>
                              <td className="py-3">
                                {row.cpu_usage?.toFixed(1)}
                              </td>
                              <td className="py-3">
                                {row.memory_usage?.toFixed(1)}
                              </td>
                              <td className="py-3">
                                {row.latency?.toFixed(1)}
                              </td>
                              <td className="py-3">
                                {new Date(row.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Helper: groupLatestByHost
 */
function groupLatestByHost(
  metrics: Metric[]
): Array<Metric & { host: string }> {
  if (!metrics || metrics.length === 0) return [];
  const sorted = [...metrics].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
  );
  const seen = new Set<string>();
  const result: Metric[] = [];
  for (const m of sorted) {
    if (!seen.has(m.host)) {
      seen.add(m.host);
      result.push(m);
    }
  }
  return result;
}
