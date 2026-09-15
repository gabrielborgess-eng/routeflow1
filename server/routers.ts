import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { listOrders, listVehicles } from "./db";

const demoOrders = [
  { id: "o1", code: "RF-2048", client: "Mercado Aurora", status: "pending", weightKg: 420, distanceKm: 13.4, priority: "high" },
  { id: "o2", code: "RF-2049", client: "Restaurante Origami", status: "in_route", weightKg: 180, distanceKm: 8.2, priority: "normal" },
  { id: "o3", code: "RF-2050", client: "Clínica Vitta", status: "pending", weightKg: 95, distanceKm: 6.8, priority: "high" },
];

const demoVehicles = [
  { id: "v1", name: "Truck 01", plate: "FRT-4A21", capacityKg: 1200, currentLoadKg: 920, status: "in_route" },
  { id: "v2", name: "Van 02", plate: "GHE-8B94", capacityKg: 650, currentLoadKg: 280, status: "available" },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  orders: router({
    list: publicProcedure.query(async () => {
      const stored = await listOrders();
      return stored.length ? stored : demoOrders;
    }),
  }),
  vehicles: router({
    list: publicProcedure.query(async () => {
      const stored = await listVehicles();
      return stored.length ? stored : demoVehicles;
    }),
  }),
  routes: router({
    optimize: publicProcedure.input(z.object({ orderIds: z.array(z.string()).min(1) })).mutation(({ input }) => ({
      orderIds: [...input.orderIds].sort((a, b) => a.localeCompare(b)),
      distanceKm: 127.4,
      durationMinutes: 192,
      algorithm: "nearest-neighbor + priority-aware",
    })),
  }),
});

export type AppRouter = typeof appRouter;
