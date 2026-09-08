# Class Command

A single-page web app that answers one question better than any LMS: **what should I work on right now, and why.**

Ingests your courses and assignments, ranks them by grade impact per usable day remaining, and surfaces the result in four priority bands: Do Now, This Week, On Deck, Later.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173. Click "Load Demo Data" for a quick tour, or add your courses in Setup.

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, or GitHub Pages as a static site.

## Canvas Calendar Feed

To import assignments from Canvas:

1. In Canvas, go to **Calendar** (left sidebar)
2. Click **Calendar Feed** (bottom of the page)
3. Copy the URL and paste it into your browser to download the `.ics` file
4. In Class Command, go to **Setup > ICS Import** and drag the `.ics` file onto the drop zone

**Warning:** The Canvas calendar feed URL is unauthenticated — anyone with the URL can see your assignment schedule. Never commit it to source control or share it publicly.

After import, you will need to assign grade categories and point values to imported items. The ICS feed does not include this information.

Re-importing the same file updates due dates while preserving your status, notes, and grade data.

## How Scoring Works

Every assignment gets a **priority score** based on two factors:

### Grade Impact
What percentage of your final grade is this worth? A 100-point midterm in a 40% category with 2 exams = 20% of your grade. A 100-point homework in a 20% category with 10 assignments = 2%.

If the category has a drop-lowest policy, impact is reduced proportionally.

### Runway (Usable Days)
Not "days until due" — **days until due minus days of work required.**

```
usableDays = daysUntilDue - (effortHours / dailyCapacityHours)
```

An 8-hour project due in 3 days with a 4-hour daily capacity has 1 usable day — not 3.

### Priority Score
```
score = gradeImpact / max(usableDays, 0.25)
```

When usable days hit zero, the score spikes — meaning you're already behind schedule even though it isn't due yet.

### Bands
Assignments are placed into bands by rule, then sorted within each band by score:
- **Do Now**: overdue, or usable days <= 0, or due within 2 days
- **This Week**: due within 7 days
- **On Deck**: due within 21 days
- **Later**: everything else

## Data Storage

All data lives in your browser's `localStorage`. There is no server, no account, no cloud sync.

Use **Setup > Export JSON** to back up your data. Use **Import JSON** to restore on another device.

## Running Tests

```bash
npm test
```

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- ical.js for .ics parsing
- Vitest for tests
