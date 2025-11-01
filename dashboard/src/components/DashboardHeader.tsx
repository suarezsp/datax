import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metric, Alert } from "@/types";

interface DashboardHeaderProps {
  metrics?: Metric[];
  alerts?: Alert[];
  onHostChange?: (host: string) => void;
}

export function DashboardHeader({ metrics = [], alerts = [], onHostChange }: DashboardHeaderProps) {
  const [host, setHost] = useState("server01");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setHost(value);
    onHostChange?.(value);
  };

  const activeAlerts = alerts.filter(a => a.status === "active").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Selected Host</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={host}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
          >
            {/* options for now */}
            <option value="server01">server01</option>
            <option value="server02">server02</option>
            <option value="server03">server03</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Metrics Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{activeAlerts}</div>
        </CardContent>
      </Card>
    </div>
  );
}
