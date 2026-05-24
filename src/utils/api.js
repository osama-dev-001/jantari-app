import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeApiTimings } from './prayerUtils';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function cacheKey(city, date) {
  return `jantari_${city}_${date}`;
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10); // "2026-05-05"
}

/**
 * Fetch prayer timings from Aladhan API.
 * Uses cache — only hits network if no valid cache exists.
 *
 * @param {string} city   - City name, e.g. "Delhi"
 * @param {string} country - Country name, e.g. "India"
 * @param {number} method  - Calculation method (1 = University of Islamic Sciences, Karachi)
 */
export async function fetchTimings(city, country = 'India', method = 1) {
  const date = todayDateStr();
  const key = cacheKey(`${city}_${country}`, date);

  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { timings, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return timings; // fresh cache
      }
    }
  } catch (_) {}

  // Cache miss or stale — hit the API
  const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Aladhan API error: ${res.status}`);

  const json = await res.json();
  const raw = json.data.timings;
  const timings = normalizeApiTimings(raw);

  // Store in cache
  await AsyncStorage.setItem(key, JSON.stringify({ timings, timestamp: Date.now() }));

  return timings;
}

/**
 * Resolve timings for a city.
 * Static cities (vns, amd) return immediately — no network.
 * Others fall through to Aladhan.
 */
export async function resolveTimings(cityKey, staticDataMap) {
  if (staticDataMap[cityKey]) {
    const { getTodayTimings } = require('./prayerUtils');
    return getTodayTimings(staticDataMap[cityKey]);
  }

  // Dynamic cities — expects cityKey like "delhi|India" or just "delhi"
  const [city, country = 'India'] = cityKey.split('|');
  return await fetchTimings(city, country);
}