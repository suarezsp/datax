import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlerts, resolveAlert } from "@/services/api";
import type { Alert } from "@/types";

export const useAlerts = () => {
  return useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    refetchInterval: 7000,
    staleTime: 2000,
  });
};

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => resolveAlert(id),
    onSuccess: () => {
      //invalidates cache after resolution
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}