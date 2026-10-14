# File: prayer-time-calculation-strategy.md

# Prayer Time Calculation Strategy

## Objective

Implement a reliable, offline-first prayer time system for the "Live Schedule" tab.

The application should prioritize the most accurate local mosque timings while remaining fully functional without an internet connection.

---

## Recommended Architecture

Priority order:

1. Local Mosque Database
2. Local Calculation (Adhan.js)
3. Online API (Optional Fallback)

```
                User opens app
                       │
                       ▼
          Is city in local mosque DB?
                │             │
               Yes            No
                │             │
                ▼             ▼
      Use local timings   Calculate via Adhan.js
                │             │
                └──────► Display timings
```

Optional online fallback:

```
Local Mosque Database
          │
          ▼
      Adhan.js
          │
          ▼
    AlAdhan API (Optional)
```

---

## Why This Approach?

### Local Mosque Database

Pros

- Highest accuracy
- Matches the local mosque
- Works offline
- No external dependency

Cons

- Requires manual maintenance
- Not scalable for every city

---

### Adhan.js

Use Adhan.js as the primary fallback whenever a city is not available in the local database.

Pros

- Completely free
- Works entirely offline
- No API key
- No rate limits
- Instant calculations
- Available for:
  - JavaScript
  - Node.js
  - Android
  - iOS
  - Swift
  - Python

Prayer times are calculated using:

- Latitude
- Longitude
- Date
- Timezone
- Calculation Method

These are the same astronomical calculations performed by online prayer time APIs.

---

## Location Requirements

Adhan.js requires geographical coordinates.

Preferred order:

### Option 1 (Recommended)

Use device GPS after requesting user permission.

Advantages

- Most accurate
- Automatic

---

### Option 2

Allow users to select their city.

Maintain a lightweight city database.

Example:

```json
{
  "city": "Varanasi",
  "country": "India",
  "latitude": 25.3176,
  "longitude": 82.9739,
  "timezone": "Asia/Kolkata"
}
```

Only latitude, longitude, and timezone are required.

---

## Why Not Use an API as Primary?

APIs introduce:

- Internet dependency
- Possible downtime
- Rate limits
- Slower response times
- Third-party reliance

Since prayer times are deterministic calculations rather than live data, they can be computed locally with identical formulas.

---

## Local Mosque vs Calculated Times

Small differences (typically 1–5 minutes) may exist because local mosques often follow regional committees or make slight adjustments.

Example:

```
Calculated Maghrib : 6:54 PM
Local Mosque       : 6:56 PM
```

This does not indicate an error.

Whenever verified local mosque data exists, it should always take precedence.

---

## Optional API

If an online fallback is ever needed, the recommended service is:

### AlAdhan API

Reasons

- Free
- No API key
- Worldwide coverage
- Multiple calculation methods
- Well documented
- Reliable

Use only when:

- Coordinates cannot be determined
- City is unavailable
- Server-side verification is desired

---

## Future Improvements

- User-selectable calculation methods
- Automatic GPS detection
- Offline city coordinate database
- Community-submitted mosque timings with admin approval
- Daily cache for any API responses

---

## Final Recommendation

Implement an offline-first architecture.

Priority:

1. Local Mosque Database
2. Adhan.js (Primary Fallback)
3. AlAdhan API (Optional Emergency Fallback)

This provides:

- Offline functionality
- Fast performance
- No recurring costs
- No rate limits
- High reliability
- Better user experience
- Independence from third-party services