### Project Specification: TCF Vocabulary & Study Tracker

#### 1. Overview & Architecture

* **Hosting:** Static hosting via **GitHub Pages**.
* **Tech Stack:** Vanilla HTML/CSS/JavaScript (or lightweight Vite + React/Tailwind) so it deploys with zero backend costs and works on mobile/desktop.
* **Data Storage:** Static JSON files located in a `/data` folder in the repository. Vocabulary is split into per-day files under `/data/words/` plus an `/data/words/index.json` manifest, and study totals stay in `/data/daily_stats.json`. Updates are made via commits or editing directly on GitHub.
* **Key Features:**
* Interactive flashcard practice with multi-language hints (EN/ZH) and source tags.
* Activity contribution calendar (GitHub-style heat map) reflecting daily vocabulary counts.
* Summary dashboard tracking question breakdowns (Listening vs. Reading by CEFR levels: A1–C2).



---

#### 2. Data Schemas

**`data/words/index.json`**

```json
[
  "2026-09-08.json",
  "2026-09-09.json",
  "2026-09-10.json",
  "2026-09-11.json",
  "2026-09-12.json"
]
```

**`data/words/2026-09-12.json`**

```json
[
  {
    "id": "2026-09-12-001",
    "dateAdded": "2026-09-12",
    "word": "sec",
    "gender": "adj",
    "english": "dry",
    "chinese": "干燥的",
    "examples": [
      {
        "french": "Temps chaud et sec au sud de l'Europe.",
        "english": "Hot and dry weather in southern Europe."
      }
    ],
    "source": {
      "raw": "src: l-t-5-q6",
      "type": "listening",
      "test": 5,
      "question": 6
    },
    "tags": ["weather"]
  }
]
```

**`data/daily_stats.json`**

```json
[
  {
    "date": "2026-09-12",
    "wordsAddedCount": 11,
    "listeningQuestions": {
      "a1": 0, "a2": 0, "b1": 0, "b2": 0, "c1": 0, "c2": 0
    },
    "readingQuestions": {
      "a1": 0, "a2": 0, "b1": 0, "b2": 0, "c1": 0, "c2": 0
    },
    "notes": "Focused on test 5 listening."
  }
]

```

---

#### 3. Core Modules & Requirements

**Module A: Flashcards**

* **Card Front:** French word, grammatical category/gender, audio playback button (using browser native `window.speechSynthesis`), and source pill (e.g., `🎧 Test 5 - Q6` or `📖 Test 2 - Q14`).
* **Card Back / Reveal:** English translation, Chinese translation, sample sentences with their translations, and related synonyms/notes.
* **Interactions:** Tap/space to flip; keyboard arrows or swipe gestures (mobile) for "Next / Previous" or "Know / Don't Know". Filter cards by date added or question source type.

**Module B: Summary Dashboard**

* **GitHub-Style Contribution Heat Map:**
* 365-day grid displaying squares shaded by number of words added per day (0 = gray, 1–5 = light green, 6–10 = green, 11+ = dark green).
* Hover/tap shows: `"YYYY-MM-DD: X words added"`.


* **Daily Metric Counters:**
* Today's words added.
* Cumulative questions practiced table/bars categorized by skill and level:



| Level | Listening Questions | Reading Questions |
| --- | --- | --- |
| **A1** | 0 | 0 |
| **A2** | 0 | 0 |
| **B1** | 0 | 0 |
| **B2** | 0 | 0 |
| **C1** | 0 | 0 |
| **C2** | 0 | 0 |

---