import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "@/services/api";
import type { Metric } from "@/types";

export const useMetrics = (host?: string) => {
  return useQuery<Metric[], Error>({
    queryKey: ["metrics", host],
    queryFn: async () => {
      const data = await getMetrics(host);
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 5000,
    staleTime: 2000,
    placeholderData: (prev) => prev,
  });
};