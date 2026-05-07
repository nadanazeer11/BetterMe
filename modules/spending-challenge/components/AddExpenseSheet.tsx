// Bottom sheet for adding an out-of-hand expense to a challenge. Uses
// BottomSheetTextInput so the keyboard plays nicely with the sheet.

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelButton } from "@/shared/ui/PastelButton";
import { PastelInput } from "@/shared/ui/PastelInput";
import { SoftCard } from "@/shared/ui/SoftCard";
import { palette } from "@/shared/theme/colors";
import { createExpense } from "../db/queries";
import { localISODate } from "../lib/dates";

export type AddExpenseSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type AddExpenseSheetProps = {
  challengeId: string;
};

export const AddExpenseSheet = forwardRef<AddExpenseSheetHandle, AddExpenseSheetProps>(
  function AddExpenseSheet({ challengeId }, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [showDate, setShowDate] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      present: () => {
        setName("");
        setAmount("");
        setDate(new Date());
        setError(null);
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const onSave = async () => {
      setError(null);
      if (!name.trim()) return setError("What was it for?");
      const n = parseFloat(amount);
      if (!Number.isFinite(n) || n <= 0) {
        return setError("Amount must be a positive number.");
      }
      setBusy(true);
      try {
        await createExpense({
          challengeId,
          name: name.trim(),
          amount: n,
          spentOn: localISODate(date),
        });
        sheetRef.current?.dismiss();
      } catch (e: any) {
        setError(e?.message ?? "Could not save.");
      } finally {
        setBusy(false);
      }
    };

    const formattedDate = date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["62%", "90%"]}
        index={0}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: palette.cream }}
        handleIndicatorStyle={{ backgroundColor: palette.ink.faint }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.4}
          />
        )}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}>
          <Heading size="md">Out-of-hand expense</Heading>
          <Body tone="soft" className="mt-2">
            Things you had to pay for. Doesn't touch your daily allowance.
          </Body>

          <View className="mt-6 gap-4">
            <PastelInput
              TextInputComponent={BottomSheetTextInput}
              label="What for"
              value={name}
              onChangeText={setName}
              placeholder="e.g. fuel, gift"
              autoCapitalize="sentences"
              autoFocus
            />
            <PastelInput
              TextInputComponent={BottomSheetTextInput}
              label="Amount (EGP)"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={error}
            />
            <Pressable onPress={() => setShowDate(true)}>
              <SoftCard hue="lavender" tone="soft">
                <Body tone="soft" size="sm" className="font-display-semibold">
                  Date
                </Body>
                <Body className="font-display-semibold mt-1">{formattedDate}</Body>
              </SoftCard>
            </Pressable>
            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, d) => {
                  setShowDate(Platform.OS === "ios");
                  if (d) setDate(d);
                }}
              />
            )}
          </View>

          <View className="mt-8">
            <PastelButton
              label={busy ? "Saving…" : "Save expense"}
              hue="peach"
              onPress={onSave}
              disabled={busy}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
