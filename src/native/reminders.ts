import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import type { PlannedReminder } from '../core/reminders';
import type { ReminderSound } from '../store/settings';

// Thin wrapper over the Kotlin module in android/.../reminders. Missing in
// tests (and would be on any non-Android build), so every call degrades to a no-op.

type Native = {
  schedule(items: PlannedReminder[], sound: ReminderSound): Promise<number>;
  dismiss(notifyIds: number[]): void;
  showNow(title: string, body: string): Promise<boolean>;
  previewSound(sound: ReminderSound): void;
  getStatus(): Promise<{ canPost: boolean; exactAlarms: boolean; pending: number; nextAt?: number }>;
  openNotificationSettings(): void;
  openExactAlarmSettings(): void;
};

const native: Native | undefined = NativeModules.IslamicReminders;

export type ReminderStatus = { available: boolean; canPost: boolean; exactAlarms: boolean; pending: number; nextAt?: number };

export const nativeReminders = {
  available: !!native,
  schedule: (items: PlannedReminder[], sound: ReminderSound) => native?.schedule(items, sound) ?? Promise.resolve(0),
  dismiss: (notifyIds: number[]) => native?.dismiss(notifyIds),
  showNow: (title: string, body: string) => native?.showNow(title, body) ?? Promise.resolve(false),
  previewSound: (sound: ReminderSound) => native?.previewSound(sound),
  async status(): Promise<ReminderStatus> {
    if (!native) return { available: false, canPost: false, exactAlarms: false, pending: 0 };
    return { available: true, ...(await native.getStatus()) };
  },
  openNotificationSettings: () => native?.openNotificationSettings(),
  openExactAlarmSettings: () => native?.openExactAlarmSettings(),
  /** Android 13+ asks the user at runtime; older versions allow notifications by default. */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (Platform.Version < 33) return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  },
};
