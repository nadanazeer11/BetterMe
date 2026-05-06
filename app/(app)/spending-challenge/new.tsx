import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MotiView } from "moti";
import { Screen } from "@/shared/ui/Screen";
import { Heading } from "@/shared/ui/Heading";
import { Body } from "@/shared/ui/Body";
import { PastelInput } from "@/shared/ui/PastelInput";
import { PastelButton } from "@/shared/ui/PastelButton";
import { SoftCard } from "@/shared/ui/SoftCard";
import { palette } from "@/shared/theme/colors";
import { useAuth } from "@/shared/auth/AuthProvider";
import {
  createChallenge,
  dayCountBetween,
  localISODate,
} from "@/modules/spending-challenge";

export default function NewChallenge() {
  const router = useRouter();
  const { user } = useAuth();

  const today = new Date();
  const inAMonth = new Date();
  inAMonth.setDate(today.getDate() + 29); // 30 days inclusive

  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [minPerDay, setMinPerDay] = useState("");
  const [maxPerDay, setMaxPerDay] = useState("");
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(inAMonth);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startISO = localISODate(startDate);
  const endISO = localISODate(endDate);
  const dayCount = dayCountBetween(startISO, endISO);

  const parseOptionalAmount = (s: string): number | undefined => {
    const trimmed = s.trim();
    if (!trimmed) return undefined;
    const n = parseFloat(trimmed);
    return Number.isFinite(n) ? n : NaN;
  };

  const onSubmit = async () => {
    setError(null);
    if (!user) return;
    if (!name.trim()) return setError("Give it a name.");

    const totalNum = parseFloat(total);
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      return setError("Total budget must be a positive number.");
    }
    if (dayCount < 1) return setError("End date must be on or after start date.");

    const minNum = parseOptionalAmount(minPerDay);
    const maxNum = parseOptionalAmount(maxPerDay);
    if (Number.isNaN(minNum)) return setError("Min per day is not a valid number.");
    if (Number.isNaN(maxNum)) return setError("Max per day is not a valid number.");
    if (minNum != null && minNum < 0) return setError("Min per day cannot be negative.");
    if (maxNum != null && maxNum <= 0) return setError("Max per day must be positive.");
    if (minNum != null && maxNum != null && minNum > maxNum) {
      return setError("Min per day cannot be greater than max per day.");
    }

    setSubmitting(true);
    try {
      const { challenge } = await createChallenge({
        userId: user.id,
        name: name.trim(),
        totalBudget: totalNum,
        startDate: startISO,
        endDate: endISO,
        minPerDay: minNum ?? null,
        maxPerDay: maxNum ?? null,
      });
      router.replace(`/(app)/spending-challenge/${challenge.id}` as any);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll keyboardAware>
      <View className="pt-2 pb-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={palette.ink.base} />
        </Pressable>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        className="pt-4 pb-6"
      >
        <Heading size="xl">New challenge</Heading>
        <Body tone="soft" className="mt-2">
          Set the dates and budget. Daily allowances are randomly distributed.
        </Body>
      </MotiView>

      <View className="gap-4">
        <PastelInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. May"
          autoCapitalize="words"
        />

        <DateRow
          label="Start date"
          value={startDate}
          onPress={() => setShowStart(true)}
        />
        {showStart && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, d) => {
              setShowStart(Platform.OS === "ios");
              if (d) setStartDate(d);
            }}
          />
        )}

        <DateRow
          label="End date"
          value={endDate}
          onPress={() => setShowEnd(true)}
        />
        {showEnd && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={startDate}
            onChange={(_, d) => {
              setShowEnd(Platform.OS === "ios");
              if (d) setEndDate(d);
            }}
          />
        )}

        <PastelInput
          label={`Total budget — EGP — across ${dayCount} day${dayCount === 1 ? "" : "s"}`}
          value={total}
          onChangeText={setTotal}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>

      <View className="mt-8">
        <Body tone="soft" size="sm" className="uppercase tracking-widest mb-3">
          optional bounds
        </Body>
        <Body tone="soft" size="sm" className="mb-4">
          Cap the spread so no single day gets too little or too much.
        </Body>
        <View className="gap-4">
          <PastelInput
            label="Min per day (EGP)"
            value={minPerDay}
            onChangeText={setMinPerDay}
            placeholder="leave empty for no minimum"
            keyboardType="decimal-pad"
          />
          <PastelInput
            label="Max per day (EGP)"
            value={maxPerDay}
            onChangeText={setMaxPerDay}
            placeholder="leave empty for no maximum"
            keyboardType="decimal-pad"
            error={error}
          />
        </View>
      </View>

      <View className="mt-8">
        <PastelButton
          label={submitting ? "Creating…" : "Create challenge"}
          hue="sage"
          onPress={onSubmit}
          disabled={submitting}
        />
      </View>
    </Screen>
  );
}

function DateRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: Date;
  onPress: () => void;
}) {
  const formatted = value.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <Pressable onPress={onPress}>
      <SoftCard hue="lavender" tone="soft">
        <Body tone="soft" size="sm" className="font-display-semibold">
          {label}
        </Body>
        <Body className="font-display-semibold mt-1">{formatted}</Body>
      </SoftCard>
    </Pressable>
  );
}
