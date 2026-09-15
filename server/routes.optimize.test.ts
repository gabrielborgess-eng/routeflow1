import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("routes.optimize", () => {
  it("returns a deterministic route plan with distance and duration", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.routes.optimize({ orderIds: ["o3", "o1", "o2"] });

    expect(result.orderIds).toEqual(["o1", "o2", "o3"]);
    expect(result.distanceKm).toBeGreaterThan(0);
    expect(result.durationMinutes).toBeGreaterThan(0);
    expect(result.algorithm).toContain("priority-aware");
  });
});
