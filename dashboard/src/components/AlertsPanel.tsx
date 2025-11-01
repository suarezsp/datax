import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Alert } from "@/types";

interface AlertsPanelProps {
  alerts?: Alert[];
}

export function AlertsPanel({ alerts = [] }: AlertsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No alerts detected</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-md border p-2 bg-destructive/10">
              <div className="font-semibold text-destructive">{alert.type}</div>
              <div className="text-xs text-muted-foreground">{alert.timestamp}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
