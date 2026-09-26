/**
 * WordPress REST client (spec 17.9). Server-only — never imported from a
 * client component, so WORDPRESS_APP_PASSWORD never reaches the browser.
 *
 * Behavior:
 *  - 8-second AbortController timeout on every request.
 *  - Public reads go unauthenticated; write operations require Application
 *    Password credentials (WORDPRESS_USERNAME + WORDPRESS_APP_PASSWORD)
 *    sent as a Basic auth header, checked BEFORE any request is made.
 *  - Failures raise WordPressError with an honest, specific message that
 *    surfaces to the error boundary ("WordPress unreachable at <host>…") —
 *    the app shows an error rather than fake data.
 */

export const WP_REQUEST_TIMEOUT_MS = 8_000;

export class WordPressError extends Error {
  /** HTTP status when the server answered with a non-2xx code. */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "WordPressError";
    if (status !== undefined) this.status = status;
  }
}

export interface WpClientConfig {
  /** Site origin, e.g. https://wp.example.com (used in error messages). */
  baseUrl: string;
  /** REST root, e.g. https://wp.example.com/wp-json */
  apiUrl: string;
  username?: string;
  appPassword?: string;
  timeoutMs?: number;
}

export type WpEnvLike = Record<string, string | undefined>;

/**
 * Resolve connector config from an env object (pass process.env in the
 * app; tests pass literal matrices). Throws WordPressError when neither
 * WORDPRESS_BASE_URL nor WORDPRESS_API_URL is set — a clear, honest
 * startup failure instead of a silently wrong mode.
 */
export function resolveWpConfig(env: WpEnvLike = process.env): WpClientConfig {
  const rawApi = env.WORDPRESS_API_URL?.trim();
  const rawBase = env.WORDPRESS_BASE_URL?.trim();
  if (!rawApi && !rawBase) {
    throw new WordPressError(
      'CMS_MODE=wordpress but neither WORDPRESS_BASE_URL nor WORDPRESS_API_URL is set. Fix the environment (see .env.example) or unset CMS_MODE to run on MongoDB.',
    );
  }
  const baseUrl = (rawBase ?? rawApi!.replace(/\/wp-json\/?$/, "")).replace(/\/+$/, "");
  const apiUrl = (rawApi ?? `${baseUrl}/wp-json`).replace(/\/+$/, "");
  const username = env.WORDPRESS_USERNAME?.trim() || undefined;
  const appPassword = env.WORDPRESS_APP_PASSWORD?.trim() || undefined;
  return { baseUrl, apiUrl, username, appPassword, timeoutMs: WP_REQUEST_TIMEOUT_MS };
}

export interface WpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  /** JSON body (automatically serialized). */
  body?: unknown;
  /** Attach the Application Password auth header (required for writes). */
  auth?: boolean;
}

export interface WpResponse<T> {
  data: T;
  headers: Headers;
}

export class WpClient {
  readonly config: WpClientConfig;
  private readonly fetchImpl: typeof fetch;

  constructor(config: WpClientConfig, fetchImpl: typeof fetch = fetch) {
    this.config = config;
    this.fetchImpl = fetchImpl;
  }

  /** Throw a clear error when a write is attempted without credentials. */
  requireAuth(): void {
    if (!this.config.username || !this.config.appPassword) {
      throw new WordPressError(
        `Writing to WordPress at ${this.config.baseUrl} requires WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD (Application Passwords, Profile → Application Passwords). Reads stay public.`,
      );
    }
  }

  private buildUrl(path: string, query: WpRequestOptions["query"]): string {
    const url = new URL(`${this.config.apiUrl}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private authHeader(): Record<string, string> {
    if (!this.config.username || !this.config.appPassword) return {};
    const token = Buffer.from(
      `${this.config.username}:${this.config.appPassword}`,
      "utf8",
    ).toString("base64");
    return { Authorization: `Basic ${token}` };
  }

  async request<T>(path: string, options: WpRequestOptions = {}): Promise<WpResponse<T>> {
    const { method = "GET", query, body, auth = false } = options;
    if (auth) this.requireAuth();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs ?? WP_REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await this.fetchImpl(this.buildUrl(path, query), {
        method,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(auth ? this.authHeader() : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      const detail = isAbort
        ? `request timed out after ${Math.round((this.config.timeoutMs ?? WP_REQUEST_TIMEOUT_MS) / 1000)}s`
        : error instanceof Error
          ? error.message
          : "network error";
      throw new WordPressError(
        `WordPress unreachable at ${this.config.baseUrl} (${path}) — ${detail}. Showing this error instead of pretending content exists.`,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      let detail = "";
      try {
        const parsed = (await response.json()) as { message?: string; code?: string };
        detail = parsed?.message ? `: ${parsed.message}` : parsed?.code ? `: ${parsed.code}` : "";
      } catch {
        detail = "";
      }
      throw new WordPressError(
        `WordPress at ${this.config.baseUrl} returned HTTP ${response.status} for ${path}${detail}.`,
        response.status,
      );
    }

    if (response.status === 204) {
      return { data: undefined as T, headers: response.headers };
    }
    let data: T;
    try {
      data = (await response.json()) as T;
    } catch {
      throw new WordPressError(
        `WordPress at ${this.config.baseUrl} returned a non-JSON body for ${path}.`,
      );
    }
    return { data, headers: response.headers };
  }

  get<T>(path: string, query?: WpRequestOptions["query"]): Promise<WpResponse<T>> {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T>(path: string, body: unknown, query?: WpRequestOptions["query"]): Promise<WpResponse<T>> {
    return this.request<T>(path, { method: "POST", query, body, auth: true });
  }

  put<T>(path: string, body: unknown, query?: WpRequestOptions["query"]): Promise<WpResponse<T>> {
    return this.request<T>(path, { method: "PUT", query, body, auth: true });
  }

  delete<T>(path: string, query?: WpRequestOptions["query"]): Promise<WpResponse<T>> {
    return this.request<T>(path, { method: "DELETE", query, auth: true });
  }
}
