import { describe, expect, it } from "vitest";
import { getGreeting } from "./greeting";

describe("getGreeting", () => {
  it("greets with Guten Morgen in the early/late morning", () => {
    expect(getGreeting(5)).toBe("Guten Morgen");
    expect(getGreeting(10)).toBe("Guten Morgen");
  });

  it("greets with Guten Tag around midday and afternoon", () => {
    expect(getGreeting(11)).toBe("Guten Tag");
    expect(getGreeting(17)).toBe("Guten Tag");
  });

  it("greets with Guten Abend in the evening and night", () => {
    expect(getGreeting(18)).toBe("Guten Abend");
    expect(getGreeting(23)).toBe("Guten Abend");
    expect(getGreeting(0)).toBe("Guten Abend");
    expect(getGreeting(4)).toBe("Guten Abend");
  });
});
