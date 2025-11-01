import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@/types";
import { getAlerts } from "@/services/api";

export const useAlerts = () => {
  return useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    refetchInterval: 7000,
  });
};
