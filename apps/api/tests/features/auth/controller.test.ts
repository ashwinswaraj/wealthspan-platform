import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSession } from "../../../src/features/auth/controller";
import { fetchSupabaseUser } from "../../../src/features/auth/service";
import type { AuthContext } from "../../../src/features/auth/types";

// Mock the service layer
vi.mock("../../../src/features/auth/service", () => ({
  fetchSupabaseUser: vi.fn(),
  revokeSupabaseSession: vi.fn(),
}));

describe("getSession", () => {
  const mockCtx: AuthContext = {
    supabaseUrl: "https://test.supabase.co",
    supabasePublishableKey: "test-key",
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    const request = new Request("http://localhost/auth/session");

    const response = await getSession(request, mockCtx);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(fetchSupabaseUser).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header format is invalid", async () => {
    const request = new Request("http://localhost/auth/session", {
      headers: { authorization: "InvalidToken123" },
    });

    const response = await getSession(request, mockCtx);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(fetchSupabaseUser).not.toHaveBeenCalled();
  });

  it("should return 401 if token is valid but fetchSupabaseUser returns null", async () => {
    const request = new Request("http://localhost/auth/session", {
      headers: { authorization: "Bearer valid-token-but-no-user" },
    });

    vi.mocked(fetchSupabaseUser).mockResolvedValueOnce(null);

    const response = await getSession(request, mockCtx);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(fetchSupabaseUser).toHaveBeenCalledWith("valid-token-but-no-user", mockCtx);
  });

  it("should return 200 and the session payload if token and user are valid", async () => {
    const request = new Request("http://localhost/auth/session", {
      headers: { authorization: "Bearer valid-token" },
    });

    const mockPayload = { userId: "user-123", email: "test@example.com", role: "user" };
    vi.mocked(fetchSupabaseUser).mockResolvedValueOnce(mockPayload);

    const response = await getSession(request, mockCtx);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockPayload);
    expect(fetchSupabaseUser).toHaveBeenCalledWith("valid-token", mockCtx);
  });
});
