// Bottom sheet that handles the full lifecycle of one pot:
//   - future       → "this pot opens on <date>"
//   - today/missed and not opened → "Open" reveal step
//   - opened, no status → choose: on-budget / spent less / spent more
//   - chose less or more → input the actual amount, then Save
//   - already logged    → show the result + an "Edit" affordance
//
// Owns its own ephemeral phase state — every time the sheet re-opens for a
// new pot, phase is reset via the `pot.id` prop.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelButton } from "@/shared/ui/PastelButton";
import { PastelInput } from "@/shared/ui/PastelInput";
import { palette } from "@/shared/theme/colors";
import { potState } from "../lib/potState";
import { logPotResult, openPot } from "../db/queries";
import type { Pot } from "../types";

type RevealSheetHandle = {
  present: (pot: Pot) => void;
  dismiss: () => void;
};

type RevealSheetProps = {
  todayISO: string;
};

type Phase = "reveal" | "choose" | "amount" | "logged";

export const RevealSheet = forwardRef<RevealSheetHandle, RevealSheetProps>(function RevealSheet(
  { todayISO },
  ref
) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [pot, setPot] = useState<Pot | null>(null);
  const [phase, setPhase] = useState<Phase>("reveal");
  const [direction, setDirection] = useState<"less" | "more">("less");
  const [amountInput, setAmountInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    present: (p: Pot) => {
      setPot(p);
      setPhase(initialPhase(p, todayISO));
      setAmountInput("");
      setError(null);
      sheetRef.current?.present();
    },
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  // If the same pot row gets updated externally (sync, edit), reflect new
  // status without yanking the user out of an in-flight phase.
  useEffect(() => {
    if (!pot) return;
    if (pot.status && phase !== "amount") setPhase("logged");
  }, [pot, phase]);

  if (!pot) {
    return (
      <BottomSheetModal ref={sheetRef} snapPoints={["55%"]}>
        <BottomSheetView>
          <View />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }

  const state = potState(pot, todayISO);
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const onOpen = async () => {
    setBusy(true);
    try {
      await openPot(pot.id);
      setPot({ ...pot, openedAt: new Date().toISOString() });
      setPhase("choose");
    } finally {
      setBusy(false);
    }
  };

  const onMet = async () => {
    setBusy(true);
    try {
      await logPotResult({ potId: pot.id, actualSpent: pot.amount });
      setPot({ ...pot, actualSpent: pot.amount, status: "met" });
      setPhase("logged");
    } finally {
      setBusy(false);
    }
  };

  const onPickDirection = (d: "less" | "more") => {
    setDirection(d);
    setAmountInput("");
    setError(null);
    setPhase("amount");
  };

  const onSaveAmount = async () => {
    const n = parseFloat(amountInput);
    if (!Number.isFinite(n) || n < 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (direction === "less" && n >= pot.amount) {
      setError(`Less than ${fmt(pot.amount)}.`);
      return;
    }
    if (direction === "more" && n <= pot.amount) {
      setError(`More than ${fmt(pot.amount)}.`);
      return;
    }
    setBusy(true);
    try {
      await logPotResult({ potId: pot.id, actualSpent: n });
      setPot({ ...pot, actualSpent: n, status: direction === "less" ? "under" : "over" });
      setPhase("logged");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["62%"]}
      backgroundStyle={{ backgroundColor: palette.cream }}
      handleIndicatorStyle={{ backgroundColor: palette.ink.faint }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      )}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}>
        <Body tone="soft" size="sm" className="uppercase tracking-widest">
          {pot.dayDate}
        </Body>

        {state === "future" && (
          <View className="mt-6">
            <Heading size="md">Not yet</Heading>
            <Body tone="soft" className="mt-3">
              This pot opens on {pot.dayDate}. Come back then.
            </Body>
          </View>
        )}

        {phase === "reveal" && state !== "future" && (
          <View className="mt-6 gap-6">
            <View>
              <Heading size="md">
                {state === "today" ? "Today's allowance" : "Catching up?"}
              </Heading>
              <Body tone="soft" className="mt-3">
                {state === "today"
                  ? "Tap to see what you've got to spend."
                  : "Open it and log what you actually spent."}
              </Body>
            </View>
            <PastelButton
              label={busy ? "Opening…" : "Open"}
              hue="butter"
              onPress={onOpen}
              disabled={busy}
            />
          </View>
        )}

        {phase === "choose" && (
          <View className="mt-6 gap-6">
            <View>
              <Heading size="xl">{fmt(pot.amount)}</Heading>
              <Body tone="soft" className="mt-3">
                Your allowance for the day. How did it go?
              </Body>
            </View>
            <View className="gap-3">
              <PastelButton label="On budget" hue="sage" onPress={onMet} disabled={busy} />
              <PastelButton label="I spent less" hue="mint" onPress={() => onPickDirection("less")} />
              <PastelButton label="I went over" hue="blush" onPress={() => onPickDirection("more")} />
            </View>
          </View>
        )}

        {phase === "amount" && (
          <View className="mt-6 gap-6">
            <View>
              <Heading size="md">
                {direction === "less" ? "How much did you spend?" : "How much did it cost?"}
              </Heading>
              <Body tone="soft" className="mt-3">
                Allowance was {fmt(pot.amount)}.
              </Body>
            </View>
            <PastelInput
              label="Amount"
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={error}
              autoFocus
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <PastelButton
                  label="Back"
                  hue="lavender"
                  variant="ghost"
                  onPress={() => setPhase("choose")}
                />
              </View>
              <View className="flex-1">
                <PastelButton
                  label={busy ? "Saving…" : "Save"}
                  hue={direction === "less" ? "mint" : "blush"}
                  onPress={onSaveAmount}
                  disabled={busy}
                />
              </View>
            </View>
          </View>
        )}

        {phase === "logged" && pot.actualSpent != null && (
          <View className="mt-6 gap-6">
            <View>
              <Body tone="soft" size="sm">
                You logged
              </Body>
              <Heading size="xl" className="mt-1">
                {fmt(pot.actualSpent)}
              </Heading>
              <Body tone="soft" className="mt-2">
                Allowance was {fmt(pot.amount)}.{" "}
                {pot.status === "met" && "Right on plan."}
                {pot.status === "under" && `Under by ${fmt(pot.amount - pot.actualSpent)}.`}
                {pot.status === "over" && `Over by ${fmt(pot.actualSpent - pot.amount)}.`}
              </Body>
            </View>
            <Pressable
              onPress={() => {
                setAmountInput(String(pot.actualSpent));
                setDirection(pot.status === "over" ? "more" : "less");
                setPhase("amount");
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="pencil-outline" size={18} color={palette.lavender.deep} />
                <Body className="font-display-semibold" style={{ color: palette.lavender.deep }}>
                  Edit
                </Body>
              </View>
            </Pressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

function initialPhase(pot: Pot, todayISO: string): Phase {
  if (pot.status) return "logged";
  if (pot.openedAt) return "choose";
  const state = potState(pot, todayISO);
  if (state === "future") return "reveal";
  return "reveal";
}
