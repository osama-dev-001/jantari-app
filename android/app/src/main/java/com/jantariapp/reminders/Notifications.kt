package com.jantariapp.reminders

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import com.jantariapp.R

object Notifications {
  const val CHANNEL_ADHKAR = "adhkar"
  const val CHANNEL_ENDING = "adhkar_ending"
  const val CHANNEL_PRAYER = "prayer"
  private val CHANNELS = listOf(CHANNEL_ADHKAR, CHANNEL_ENDING, CHANNEL_PRAYER)

  /** The phone's own notification sound. Uses the original channel ids, so existing installs keep theirs. */
  const val SOUND_SYSTEM = "system"
  const val DEFAULT_SOUND = "bell"
  private val SOUNDS = mapOf("bell" to R.raw.reminder_bell, "birds" to R.raw.reminder_birds)
  /** Sounds that were dropped; their channels are still deleted on phones that had them. */
  private val RETIRED_SOUNDS = listOf("chime", "harp")

  val AUDIO: AudioAttributes =
    AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

  private const val GOLD = 0xFFD9B46A.toInt()

  fun isKnownSound(sound: String) = sound == SOUND_SYSTEM || sound in SOUNDS

  fun soundUri(context: Context, sound: String): Uri {
    val res = SOUNDS[sound] ?: return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    // By name rather than id: channels store this URI, and ids can change between builds.
    return Uri.parse("android.resource://${context.packageName}/raw/${context.resources.getResourceEntryName(res)}")
  }

  /** Android fixes a channel's sound when the channel is created, so each sound has its own set. */
  private fun channelId(base: String, sound: String) = if (sound == SOUND_SYSTEM) base else "$base.$sound"

  fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val nm = context.getSystemService(NotificationManager::class.java)
    val sound = ReminderStore.sound(context)
    fun create(base: String, name: String, importance: Int, about: String) {
      nm.createNotificationChannel(
        NotificationChannel(channelId(base, sound), name, importance).apply {
          description = about
          if (sound != SOUND_SYSTEM) setSound(soundUri(context, sound), AUDIO)
        },
      )
    }
    create(CHANNEL_ADHKAR, "Adhkar reminders", NotificationManager.IMPORTANCE_DEFAULT, "Hourly reminders during the morning and evening adhkar times")
    create(CHANNEL_ENDING, "Adhkar time ending", NotificationManager.IMPORTANCE_HIGH, "Frequent reminders shortly before the adhkar time ends")
    create(CHANNEL_PRAYER, "Prayer times", NotificationManager.IMPORTANCE_HIGH, "An alert when each prayer time begins")

    // Only the chosen sound's channels stay listed in the phone's settings.
    for (other in SOUNDS.keys + RETIRED_SOUNDS + SOUND_SYSTEM) {
      if (other == sound) continue
      for (base in CHANNELS) {
        val id = channelId(base, other)
        if (nm.getNotificationChannel(id) != null) nm.deleteNotificationChannel(id)
      }
    }
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
    val sound = ReminderStore.sound(context)
    @Suppress("DEPRECATION")
    val builder =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Notification.Builder(context, channelId(r.channel, sound))
      } else {
        // Before Android 8 the sound belongs to each notification instead of a channel.
        Notification.Builder(context).setSound(soundUri(context, sound), AUDIO)
      }
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
