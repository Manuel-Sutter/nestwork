import { describe, expect, it } from "vitest";
import { getNotificationTargets } from "./getNotificationTargets";

describe("getNotificationTargets", () => {
  it("excludes the actor from a two-user household", () => {
    expect(getNotificationTargets("manuel", ["manuel", "anja"])).toEqual(["anja"]);
    expect(getNotificationTargets("anja", ["manuel", "anja"])).toEqual(["manuel"]);
  });

  it("returns an empty list when the actor is the only user", () => {
    expect(getNotificationTargets("manuel", ["manuel"])).toEqual([]);
  });

  it("never notifies the actor even if listed more than once", () => {
    expect(getNotificationTargets("manuel", ["manuel", "manuel", "anja"])).toEqual(["anja"]);
  });
});
