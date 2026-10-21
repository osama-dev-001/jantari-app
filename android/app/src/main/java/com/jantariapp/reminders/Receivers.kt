package com.jantariapp.reminders

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Fires a stored reminder. Content is read from the store so a reschedule always wins. */
class ReminderReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getIntExtra(ReminderScheduler.EXTRA_ID, -1)
    val pending = ReminderStore.load(context)
    val reminder = pending.find { it.id == id } ?: return
    ReminderStore.save(context, pending.filter { it.id != id })
    // A reminder that arrives very late (device asleep or off) is no longer useful.
    if (System.currentTimeMillis() - reminder.at > STALE_MS) return
    Notifications.show(context, reminder)
  }

  private companion object {
    const val STALE_MS = 20 * 60 * 1000L
  }
}

/** Alarms don't survive reboots or app updates; put them back from the store. */
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      Intent.ACTION_TIME_CHANGED,
      Intent.ACTION_TIMEZONE_CHANGED,
      -> ReminderScheduler.restore(context)
    }
  }
}
