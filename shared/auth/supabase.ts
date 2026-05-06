import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

const isWebSSR = Platform.OS === "web" && typeof window === "undefined";

const noopStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: isWebSSR ? noopStorage : AsyncStorage,
    autoRefreshToken: !isWebSSR,
    persistSession: !isWebSSR,
    detectSessionInUrl: false,
  },
});
