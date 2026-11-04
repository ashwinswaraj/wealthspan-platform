import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api";

/** "in" = logged in, "out" = needs login, "loading" = still checking. Network errors count as loading-failed, not logged out. */
export function useSession() {
  const q = useQuery({
    queryKey: ["session"],
    retry: false,
    queryFn: async () => {
      try {
        const me = await api<{ email?: string; name?: string }>("finance", "/me");
        return { email: me.email ?? "", name: me.name ?? "" };
      } catch (e) {
        if (e instanceof ApiError && e.unauthorized) return "out" as const;
        throw e;
      }
    },
  });
  const user = q.data && q.data !== "out" ? q.data : null;
  const email = user?.email ?? "";
  const first = (user?.name ?? "").trim().split(/\s+/)[0] ?? "";
  const local =
    email
      .split("@")[0]
      ?.replace(/[^a-zA-Z]+/g, " ")
      .trim()
      .split(" ")[0] ?? "";
  const given = first || local;
  return {
    /** First name, else the start of the email address, else "there". */
    displayName: given ? given[0].toUpperCase() + given.slice(1) : "there",
    fullName: (user?.name ?? "").trim() || given,
    status: q.isLoading
      ? ("loading" as const)
      : q.data === "out"
        ? ("out" as const)
        : q.data
          ? ("in" as const)
          : ("error" as const),
    refetch: q.refetch,
  };
}
