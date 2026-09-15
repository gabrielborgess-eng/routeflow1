import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  plate: varchar("plate", { length: 12 }).notNull().unique(),
  type: varchar("type", { length: 80 }).notNull(),
  capacityKg: int("capacityKg").notNull(),
  currentLoadKg: int("currentLoadKg").default(0).notNull(),
  status: mysqlEnum("status", ["available", "in_route", "maintenance"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  client: varchar("client", { length: 160 }).notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  zone: varchar("zone", { length: 80 }).notNull(),
  weightKg: int("weightKg").notNull(),
  distanceKm: decimal("distanceKm", { precision: 8, scale: 2 }).notNull(),
  deliveryWindow: varchar("deliveryWindow", { length: 40 }).notNull(),
  priority: mysqlEnum("priority", ["normal", "high"]).default("normal").notNull(),
  status: mysqlEnum("status", ["pending", "in_route", "scheduled", "delivered"]).default("pending").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
