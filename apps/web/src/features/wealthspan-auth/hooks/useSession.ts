import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api";

/** "in" = logged in, "out" = needs login, "loading" = still checking. Network errors count as loading-failed, not logged out. */
export function useSession() {
  const q = useQuery({
    queryKey: ["session"],
    retry: false,
    queryFn: async () => {
      try {
        await api("finance", "/me");
        return "in" as const;
      } catch (e) {
        if (e instanceof ApiError && e.unauthorized) return "out" as const;
        throw e;
      }
    },
  });
  return {
    status: q.isLoading ? ("loading" as const) : (q.data ?? ("error" as const)),
    refetch: q.refetch,
  };
}
