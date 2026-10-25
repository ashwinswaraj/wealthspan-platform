import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadSignup, saveSignup, clearSignup } from "./signupStorage";

describe("signupStorage", () => {
  const role = "client";
  const key = `jobrio_signup_${role}`;

  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe("when window is undefined (SSR)", () => {
    let originalWindow: typeof window;

    beforeEach(() => {
      originalWindow = globalThis.window;
      // @ts-ignore
      delete globalThis.window;
    });

    afterEach(() => {
      globalThis.window = originalWindow;
    });

    it("loadSignup returns empty object", () => {
      expect(loadSignup(role)).toEqual({});
    });

    it("saveSignup does nothing", () => {
      saveSignup(role, { test: "data" });
      expect(sessionStorage.getItem(key)).toBeNull();
    });

    it("clearSignup does nothing", () => {
      sessionStorage.setItem(key, "data");
      clearSignup(role);
      expect(sessionStorage.getItem(key)).toBe("data");
    });
  });

  describe("when window is defined", () => {
    describe("loadSignup", () => {
      it("returns empty object when no data in storage", () => {
        expect(loadSignup(role)).toEqual({});
      });

      it("returns parsed data when valid JSON is in storage", () => {
        const data = { name: "John Doe" };
        sessionStorage.setItem(key, JSON.stringify(data));
        expect(loadSignup(role)).toEqual(data);
      });

      it("returns empty object and catches JSON.parse error when invalid JSON is in storage", () => {
        // Set invalid JSON
        sessionStorage.setItem(key, "{ invalid_json ]");

        // This should not throw, but catch the error and return empty object
        expect(loadSignup(role)).toEqual({});
      });
    });

    describe("saveSignup", () => {
      it("stores JSON string in sessionStorage", () => {
        const patch = { name: "John Doe" };
        saveSignup(role, patch);
        expect(sessionStorage.getItem(key)).toBe(JSON.stringify(patch));
      });

      it("merges with existing data", () => {
        const existingData = { name: "John Doe", age: 30 };
        sessionStorage.setItem(key, JSON.stringify(existingData));

        const patch = { name: "Jane Doe", location: "US" };
        saveSignup(role, patch);

        const expected = { name: "Jane Doe", age: 30, location: "US" };
        expect(sessionStorage.getItem(key)).toBe(JSON.stringify(expected));
      });
    });

    describe("clearSignup", () => {
      it("removes key from sessionStorage", () => {
        sessionStorage.setItem(key, '{"test":"data"}');
        clearSignup(role);
        expect(sessionStorage.getItem(key)).toBeNull();
      });
    });
  });
});
