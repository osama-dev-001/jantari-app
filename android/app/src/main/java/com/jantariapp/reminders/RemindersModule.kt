package com.jantariapp.reminders

import android.content.Intent
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ViewManager

/** JS bridge: the app computes the plan, native code owns the alarms. */
class RemindersModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "IslamicReminders"

  private var preview: MediaPlayer? = null

  @ReactMethod
  fun schedule(items: ReadableArray, sound: String, promise: Promise) {
    try {
      val list =
        List(items.size()) { i ->
          val m = items.getMap(i)!!
          Reminder(
            id = m.getInt("id"),
            notifyId = m.getInt("notifyId"),
            at = m.getDouble("at").toLong(),
            title = m.getString("title") ?: "",
            body = m.getString("body") ?: "",
            channel = m.getString("channel") ?: Notifications.CHANNEL_ADHKAR,
            link = m.getString("link") ?: "islamicdaily://today",
          )
        }
      if (Notifications.isKnownSound(sound)) ReminderStore.saveSound(ctx, sound)
      Notifications.ensureChannels(ctx)
      ReminderScheduler.replaceAll(ctx, list)
      promise.resolve(list.count { it.at > System.currentTimeMillis() })
    } catch (e: Exception) {
      promise.reject("E_SCHEDULE", e)
    }
  }

  @ReactMethod
  fun dismiss(notifyIds: ReadableArray) {
    for (i in 0 until notifyIds.size()) Notifications.dismiss(ctx, notifyIds.getInt(i))
  }

  @ReactMethod
  fun showNow(title: String, body: String, promise: Promise) {
    Notifications.show(
      ctx,
      Reminder(9999, 9999, System.currentTimeMillis(), title, body, Notifications.CHANNEL_ADHKAR, "islamicdaily://dhikr"),
    )
    promise.resolve(Notifications.canPost(ctx))
  }

  /** Plays a sound at notification volume (silent when the phone is). */
  @ReactMethod
  fun previewSound(sound: String) {
    preview?.release()
    preview = null
    // A Ringtone would be simpler, but recent Android ignores its audio attributes and plays at ringer volume.
    val player = MediaPlayer()
    try {
      player.setAudioAttributes(Notifications.AUDIO)
      player.setDataSource(ctx, Notifications.soundUri(ctx, sound))
      player.setOnCompletionListener {
        it.release()
        if (preview === it) preview = null
      }
      player.prepare()
      player.start()
      preview = player
    } catch (e: Exception) {
      // E.g. the phone's notification sound is set to "None".
      player.release()
    }
  }

  @ReactMethod
  fun getStatus(promise: Promise) {
    val pending = ReminderStore.load(ctx).filter { it.at > System.currentTimeMillis() }
    val map = Arguments.createMap()
    map.putBoolean("canPost", Notifications.canPost(ctx))
    map.putBoolean("exactAlarms", ReminderScheduler.canScheduleExact(ctx))
    map.putInt("pending", pending.size)
    pending.minByOrNull { it.at }?.let { map.putDouble("nextAt", it.at.toDouble()) }
    promise.resolve(map)
  }

  @ReactMethod
  fun openNotificationSettings() {
    val intent =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, ctx.packageName)
      } else {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${ctx.packageName}"))
      }
    ctx.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
  }

  @ReactMethod
  fun openExactAlarmSettings() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    ctx.startActivity(
      Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:${ctx.packageName}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
    )
  }
}

class RemindersPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(RemindersModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
