import { expect, test, describe } from "bun:test";
import { cn } from "./utils";

describe("cn utility function", () => {
  test("joins classes", () => {
    expect(cn("base", "extra")).toBe("base extra");
  });

  test("handles conditional classes", () => {
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
