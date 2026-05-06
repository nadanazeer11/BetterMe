// Runs syncAll() on session changes (sign-in / restored session) and on app
// foreground transitions. Mounted once near the root layout.

import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/shared/auth/AuthProvider";
import { syncAll } from "./sync";

export function useSync() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    // Kick a sync on mount / sign-in.
    void syncAll();

    // And every time the app comes back to the foreground.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncAll();
    });

    return () => sub.remove();
  }, [session]);
}
