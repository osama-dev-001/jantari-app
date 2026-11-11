package com.jantariapp.reminders

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

object ReminderScheduler {
  private const val ACTION_FIRE = "com.jantariapp.reminders.FIRE"
  const val EXTRA_ID = "reminderId"

  /** Replaces every pending reminder with [items] (past ones are dropped). */
  fun replaceAll(context: Context, items: List<Reminder>) {
    ReminderStore.load(context).forEach { cancel(context, it) }
    val now = System.currentTimeMillis()
    val future = items.filter { it.at > now }
    ReminderStore.save(context, future)
    future.forEach { register(context, it) }
  }

  /** Re-registers stored reminders, e.g. after a reboot or app update. */
  fun restore(context: Context) {
    val now = System.currentTimeMillis()
    val future = ReminderStore.load(context).filter { it.at > now }
    ReminderStore.save(context, future)
    future.forEach { register(context, it) }
  }

  fun canScheduleExact(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
      context.getSystemService(AlarmManager::class.java).canScheduleExactAlarms()

  private fun pendingIntent(context: Context, r: Reminder, flags: Int): PendingIntent? {
    val intent = Intent(context, ReminderReceiver::class.java).setAction(ACTION_FIRE).putExtra(EXTRA_ID, r.id)
    return PendingIntent.getBroadcast(context, r.id, intent, flags or PendingIntent.FLAG_IMMUTABLE)
  }

  private fun register(context: Context, r: Reminder) {
    val alarms = context.getSystemService(AlarmManager::class.java)
    val pi = pendingIntent(context, r, PendingIntent.FLAG_UPDATE_CURRENT) ?: return
    // Exact while-idle alarms still fire in Doze (throttled to ~1 per 9 min,
    // which the 10-minute "ending soon" cadence stays within).
    if (canScheduleExact(context)) {
      alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, r.at, pi)
    } else {
      alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, r.at, pi)
    }
  }

  private fun cancel(context: Context, r: Reminder) {
    val pi = pendingIntent(context, r, PendingIntent.FLAG_NO_CREATE) ?: return
    context.getSystemService(AlarmManager::class.java).cancel(pi)
    pi.cancel()
  }
}
