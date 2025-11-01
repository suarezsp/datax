import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "@/services/api";
import type { Metric } from "@/types";

export const useMetrics = (host?: string) => {
  return useQuery<Metric[], Error>({
    queryKey: ["metrics", host],
    queryFn: () => getMetrics(host),
    refetchInterval: 5000,
    staleTime: 2000,
    placeholderData: (previousData) => previousData, 
  });
};
