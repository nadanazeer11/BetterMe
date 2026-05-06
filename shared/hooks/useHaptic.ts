import * as Haptics from "expo-haptics";

export function useHaptic() {
  return {
    tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    press: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    selection: () => Haptics.selectionAsync(),
  };
}
