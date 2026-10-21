package com.jantariapp.reminders

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * One scheduled notification. [id] identifies the alarm; [notifyId] is the
 * notification slot it posts into, so successive reminders for the same
 * window replace each other instead of piling up in the shade.
 */
data class Reminder(
  val id: Int,
  val notifyId: Int,
  val at: Long,
  val title: String,
  val body: String,
  val channel: String,
  val link: String,
) {
  fun toJson(): JSONObject =
    JSONObject()
      .put("id", id)
      .put("notifyId", notifyId)
      .put("at", at)
      .put("title", title)
      .put("body", body)
      .put("channel", channel)
      .put("link", link)

  companion object {
    fun fromJson(o: JSONObject) =
      Reminder(
        id = o.getInt("id"),
        notifyId = o.optInt("notifyId", o.getInt("id")),
        at = o.getLong("at"),
        title = o.getString("title"),
        body = o.getString("body"),
        channel = o.optString("channel", Notifications.CHANNEL_ADHKAR),
        link = o.optString("link", "islamicdaily://today"),
      )
  }
}

/** Pending reminders persisted so they can be re-registered after a reboot. */
object ReminderStore {
  private const val PREFS = "islamic_daily_reminders"
  private const val KEY = "pending"

  fun load(context: Context): List<Reminder> {
    val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null) ?: return emptyList()
    return try {
      val arr = JSONArray(raw)
      List(arr.length()) { Reminder.fromJson(arr.getJSONObject(it)) }
    } catch (e: Exception) {
      emptyList()
    }
  }

  fun save(context: Context, items: List<Reminder>) {
    val arr = JSONArray()
    items.forEach { arr.put(it.toJson()) }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, arr.toString()).apply()
  }
}
