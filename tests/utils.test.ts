import { expect, test, describe } from "vitest";
import { cn, safeProtocol } from "../utils";

describe("cn utility function", () => {
  test("joins classes", () => {
    expect(cn("base", "extra")).toBe("base extra");
  });

  test("handles conditional classes", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("base", true && "is-true", false && "is-false")).toBe("base is-true");
  });

  test("handles object-based classes", () => {
    expect(cn("base", { "is-active": true, "is-disabled": false })).toBe("base is-active");
  });

  test("handles undefined, null and boolean values", () => {
    expect(cn("base", undefined, null, false, true)).toBe("base");
  });

  test("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
  });

  test("handles arrays", () => {
    expect(cn(["base", "extra"])).toBe("base extra");
  });

  test("handles nested structures", () => {
    expect(cn("base", ["extra", { conditional: true }])).toBe("base extra conditional");
  });
});

describe("safeProtocol utility function", () => {
  test("allows safe protocols", () => {
    expect(safeProtocol("https://example.com")).toBe("https://example.com");
    expect(safeProtocol("http://example.com")).toBe("http://example.com");
    expect(safeProtocol("mailto:test@example.com")).toBe("mailto:test@example.com");
    expect(safeProtocol("tel:+1234567890")).toBe("tel:+1234567890");
  });

  test("allows relative paths", () => {
    expect(safeProtocol("/path/to/resource")).toBe("/path/to/resource");
    expect(safeProtocol("./relative/path")).toBe("./relative/path");
    expect(safeProtocol("../relative/path")).toBe("../relative/path");
    expect(safeProtocol("index.html")).toBe("index.html");
  });

  test("blocks dangerous protocols", () => {
    expect(safeProtocol("javascript:alert('xss')")).toBeUndefined();
    expect(safeProtocol("data:text/html,<html>")).toBeUndefined();
    expect(safeProtocol("vbscript:msgbox('hi')")).toBeUndefined();
  });

  test("is case-insensitive for protocols", () => {
    expect(safeProtocol("JAVASCRIPT:alert(1)")).toBeUndefined();
    expect(safeProtocol("Data:text/plain,hello")).toBeUndefined();
    expect(safeProtocol("vBsCrIpT:alert(1)")).toBeUndefined();
  });

  test("handles whitespace and control characters", () => {
    expect(safeProtocol("  https://example.com  ")).toBe("https://example.com");
    expect(safeProtocol("java\0script:alert(1)")).toBeUndefined();
    expect(safeProtocol("java\x01script:alert(1)")).toBeUndefined();
    expect(safeProtocol("java\x1Fscript:alert(1)")).toBeUndefined();
    expect(safeProtocol("java\x7Fscript:alert(1)")).toBeUndefined();
    expect(safeProtocol("java\x9Fscript:alert(1)")).toBeUndefined();
  });

  test("handles undefined and empty string", () => {
    expect(safeProtocol(undefined)).toBeUndefined();
    expect(safeProtocol("")).toBe("");
  });

  test("allows safe strings containing protocol names as substrings", () => {
    expect(safeProtocol("https://example.com?query=javascript:alert(1)")).toBe("https://example.com?query=javascript:alert(1)");
    expect(safeProtocol("/javascript-tutorial")).toBe("/javascript-tutorial");
  });
});
