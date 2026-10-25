// Compatibility shim mapping react-router-dom v6 API → TanStack Router.
import * as React from "react";
import {
  Link as TLink,
  useNavigate as tUseNavigate,
  useRouterState,
  useLocation as tUseLocation,
} from "@tanstack/react-router";

const shortRouteRedirects: Record<string, string> = {
  "/admin": "/dashboard/super",
  "/super": "/dashboard/super",
  "/dashboard/admin": "/dashboard/super",
  "/admin/sub": "/dashboard/super/sub",
  "/super/sub": "/dashboard/super/sub",
  "/sub": "/dashboard/super/sub",
  "/dashboard/sub": "/dashboard/super/sub",
  "/dashboard/admin/sub": "/dashboard/super/sub",
  "/client": "/dashboard/client",
  "/professional": "/dashboard/professional",
  "/active": "/dashboard/professional",
  "/professional/active": "/dashboard/professional",
  "/dashboard/active": "/dashboard/professional",
  "/dashboard/professional/active": "/dashboard/professional",
  "/trial": "/dashboard/trial",
  "/dashboard/trial": "/dashboard/trial",
};

function canonicalizePath(pathname: string) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (/^\/professional\/step-[1-5]$/.test(normalized)) return `/signup${normalized}`;
  if (/^\/client\/step-[1-4]$/.test(normalized)) return `/signup${normalized}`;
  return shortRouteRedirects[normalized] ?? pathname;
}

export const useLocation = () => {
  const loc = tUseLocation();
  return {
    pathname: loc.pathname,
    hash: loc.hash ? `#${loc.hash}` : "",
    search: loc.searchStr ?? "",
    state: (loc.state ?? null) as unknown,
    key: (loc as unknown as { key?: string }).key ?? "default",
  };
};

type NavOpts = { replace?: boolean; state?: unknown };
export const useNavigate = () => {
  const navigate = tUseNavigate();
  return React.useCallback(
    (to: string | number, opts?: NavOpts) => {
      if (typeof to === "number") {
        if (typeof window !== "undefined") window.history.go(to);
        return;
      }
      // Parse hash
      let pathname = to;
      let hash: string | undefined;
      const hi = to.indexOf("#");
      if (hi >= 0) {
        pathname = to.slice(0, hi) || "/";
        hash = to.slice(hi + 1);
      }
      pathname = canonicalizePath(pathname);
      (navigate as unknown as (o: Record<string, unknown>) => void)({
        to: pathname,
        hash,
        replace: opts?.replace,
        state: opts?.state,
      });
    },
    [navigate],
  );
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: React.ReactNode;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, state, children, ...rest }, ref) => {
    let pathname = to;
    let hash: string | undefined;
    const hi = to.indexOf("#");
    if (hi >= 0) {
      pathname = to.slice(0, hi) || "/";
      hash = to.slice(hi + 1);
    }
    pathname = canonicalizePath(pathname);
    return (
      <TLink
        ref={ref as never}
        to={pathname as never}
        hash={hash as never}
        replace={replace as never}
        state={state as never}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </TLink>
    );
  },
);
Link.displayName = "Link";

export type NavLinkProps = LinkProps & {
  end?: boolean;
  className?: string | ((args: { isActive: boolean; isPending: boolean }) => string | undefined);
  style?:
    | React.CSSProperties
    | ((args: { isActive: boolean; isPending: boolean }) => React.CSSProperties | undefined);
  children?:
    React.ReactNode | ((args: { isActive: boolean; isPending: boolean }) => React.ReactNode);
};

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, end, className, style, children, ...rest }, ref) => {
    const loc = useLocation();
    const isActive = end
      ? loc.pathname === to
      : loc.pathname === to || loc.pathname.startsWith(to + "/");
    const ctx = { isActive, isPending: false };
    const cls =
      typeof className === "function"
        ? (className as (a: typeof ctx) => string | undefined)(ctx)
        : className;
    const sty =
      typeof style === "function"
        ? (style as (a: typeof ctx) => React.CSSProperties | undefined)(ctx)
        : style;
    const kids =
      typeof children === "function"
        ? (children as (a: typeof ctx) => React.ReactNode)(ctx)
        : children;
    return (
      <Link ref={ref} to={to} className={cls} style={sty} {...rest}>
        {kids}
      </Link>
    );
  },
);
NavLink.displayName = "NavLink";

export const Outlet: React.FC = () => null;
export const BrowserRouter: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
export const Routes: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;
export const Route: React.FC<Record<string, unknown>> = () => null;

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
};

export const useParams = <
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>() => {
  const state = useRouterState();
  return (state.matches[state.matches.length - 1]?.params as T) ?? ({} as T);
};

export const useSearchParams = (): [
  URLSearchParams,
  (next: URLSearchParams | Record<string, string>) => void,
] => {
  const loc = useLocation();
  const navigate = tUseNavigate();
  const params = new URLSearchParams(loc.search);
  const setParams = (next: URLSearchParams | Record<string, string>) => {
    const sp =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    (navigate as unknown as (o: Record<string, unknown>) => void)({
      to: loc.pathname,
      search: Object.fromEntries(sp.entries()),
    });
  };
  return [params, setParams];
};
