package com.jantariapp.reminders

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import com.jantariapp.R

object Notifications {
  const val CHANNEL_ADHKAR = "adhkar"
  const val CHANNEL_ENDING = "adhkar_ending"
  const val CHANNEL_PRAYER = "prayer"
  private const val GOLD = 0xFFD9B46A.toInt()

  fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val nm = context.getSystemService(NotificationManager::class.java)
    nm.createNotificationChannel(
      NotificationChannel(CHANNEL_ADHKAR, "Adhkar reminders", NotificationManager.IMPORTANCE_DEFAULT).apply {
        description = "Hourly reminders during the morning and evening adhkar times"
      },
    )
    nm.createNotificationChannel(
      NotificationChannel(CHANNEL_ENDING, "Adhkar time ending", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "Frequent reminders shortly before the adhkar time ends"
      },
    )
    nm.createNotificationChannel(
      NotificationChannel(CHANNEL_PRAYER, "Prayer times", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "An alert when each prayer time begins"
      },
    )
  }

  fun canPost(context: Context): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) {
      return false
    }
    return context.getSystemService(NotificationManager::class.java).areNotificationsEnabled()
  }

  fun show(context: Context, r: Reminder) {
    ensureChannels(context)
    if (!canPost(context)) return
    val open =
      Intent(Intent.ACTION_VIEW, Uri.parse(r.link))
        .setPackage(context.packageName)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    val tap =
      PendingIntent.getActivity(context, r.notifyId, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    @Suppress("DEPRECATION")
    val builder =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) Notification.Builder(context, r.channel) else Notification.Builder(context)
    val notification =
      builder
        .setSmallIcon(R.drawable.ic_stat_reminder)
        .setColor(GOLD)
        .setContentTitle(r.title)
        .setContentText(r.body)
        .setStyle(Notification.BigTextStyle().bigText(r.body))
        .setCategory(Notification.CATEGORY_REMINDER)
        .setAutoCancel(true)
        .setShowWhen(true)
        .setContentIntent(tap)
        .build()
    context.getSystemService(NotificationManager::class.java).notify(r.notifyId, notification)
  }

  fun dismiss(context: Context, notifyId: Int) {
    context.getSystemService(NotificationManager::class.java).cancel(notifyId)
  }
}
