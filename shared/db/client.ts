import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema";

const expo = SQLite.openDatabaseSync("betterme.db", { enableChangeListener: true });
expo.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expo, { schema, logger: __DEV__ });
export const sqliteDb = expo;
