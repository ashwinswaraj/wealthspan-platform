/**
 * Shared hardening for every Catalyst function (finance, chat, files).
 *
 *  - requestGuard: blocks cross-site writes (CSRF). A browser cannot add a custom header to a cross-site
 *    request without a CORS preflight, and these functions never answer preflights, so requiring
 *    `X-Requested-With: wealthspan` on POST/PUT/PATCH/DELETE stops forged requests even if the session
 *    cookie is sent. `Sec-Fetch-Site: cross-site` is refused as a second layer.
 *  - rateLimit: small per-user (or per-IP) fixed window, kept in memory. It is per function instance, so it
 *    is a brake on abuse, not an exact quota (exact daily quotas live in the Data Store: see chat quota).
 *  - jsonErrors: bad JSON / oversize bodies answer a short JSON error; nothing else leaks stack traces.
 */
import type {
  ErrorRequestHandler,
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

export const CSRF_HEADER = "x-requested-with";
export const CSRF_VALUE = "wealthspan";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Call first, before body parsing and routes. */
export function hardenApp(app: Express): void {
  process.env.NODE_ENV = process.env.NODE_ENV || "production";
  app.disable("x-powered-by");
  app.set("etag", false);
}

export const requestGuard = (): RequestHandler => (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  if (SAFE_METHODS.has(req.method)) return next();
  const site = String(req.headers["sec-fetch-site"] ?? "");
  if (site === "cross-site") return deny(res);
  if (req.headers[CSRF_HEADER] !== CSRF_VALUE) return deny(res);
  next();
};

const deny = (res: Response) => {
  res.status(403).json({ error: "forbidden", message: "Request blocked." });
};

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  /** Who is being counted. Defaults to the signed-in user, else the client address. */
  key?: (req: Request) => string;
  /** Only count these methods (default: all). */
  methods?: string[];
  now?: () => number;
}

export function rateLimit(opts: RateLimitOptions): RequestHandler {
  const hits = new Map<string, { n: number; reset: number }>();
  const now = opts.now ?? Date.now;
  const keyOf =
    opts.key ??
    ((req) => String((req as Request & { userId?: string }).userId ?? req.ip ?? "anon"));
  return (req: Request, res: Response, next: NextFunction) => {
    if (opts.methods && !opts.methods.includes(req.method)) return next();
    const t = now();
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
    const key = keyOf(req);
    const h = hits.get(key);
    if (!h || h.reset <= t) {
      hits.set(key, { n: 1, reset: t + opts.windowMs });
      return next();
    }
    h.n += 1;
    if (h.n > opts.max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((h.reset - t) / 1000))));
      return void res
        .status(429)
        .json({ error: "rate_limited", message: "Too many requests. Please slow down." });
    }
    next();
  };
}

/** Last in the chain. */
export const jsonErrors = (): ErrorRequestHandler => (err, _req, res, _next) => {
  const status = Number(
    (err as { status?: number; statusCode?: number })?.status ??
      (err as { statusCode?: number })?.statusCode ??
      500,
  );
  if (status === 413)
    return void res.status(413).json({ error: "too_large", message: "That request is too large." });
  if (status >= 400 && status < 500)
    return void res
      .status(400)
      .json({ error: "bad_request", message: "That request could not be read." });
  console.error(
    "unhandled error:",
    String((err as { message?: string })?.message ?? typeof err).slice(0, 200),
  );
  res.status(500).json({ error: "server", message: "Something went wrong. Try again." });
};

export const notFound = (): RequestHandler => (_req, res) => {
  res.status(404).json({ error: "not_found", message: "Not found." });
};
