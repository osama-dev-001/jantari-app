// Shape of the curated local-mosque timetables. Month names are English
// ("January"…), Date is zero-padded ("01"…), and every time is a 12-hour
// wall-clock string like "05:23 AM" in the city's own timezone.
export type MosqueRow = {
  Date: string;
  Fajr?: string;
  Sunrise?: string;
  Zawal?: string;
  Dhuhr?: string;
  Asr?: string;
  Maghrib?: string;
  Isha?: string;
  Midnight?: string;
};

export type MosqueTimetable = Record<string, MosqueRow[]>;
