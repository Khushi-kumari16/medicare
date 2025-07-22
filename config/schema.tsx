import { integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  creadits: integer()
});

export const SessionChatTable = pgTable("session_chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  session_id: varchar("session_id").notNull(),
  notes: text("notes"),
  conversation: json(),
  report: json(),
  selectedDoctor: json("selectedDoctor"), // ✅ changed to camelCase
  createdBy: varchar("createdBy").references(() => usersTable.email), // ✅ changed to camelCase
  createdOn: varchar("createdOn"), // ✅ changed to camelCase
});
