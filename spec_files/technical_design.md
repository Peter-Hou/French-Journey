# Technical Design Spec

## 1. Purpose
This project is a static GitHub Pages web application for tracking French vocabulary study progress. The app combines flashcard practice with a contribution-style activity calendar and a progress dashboard for CEFR-based question coverage.

## 2. Constraints
- Static hosting only; no backend or database.
- Data stored in JSON files under `/data`.
- Must run on mobile and desktop in a modern browser.
- All logic should be lightweight and maintainable without frameworks unless absolutely necessary.

## 3. Architecture
### Frontend
- Plain HTML/CSS/JavaScript.
- `index.html` provides app shell structure.
- `styles.css` contains the visual design and responsive layout.
- `app.js` loads JSON, renders the UI, and binds interactions.
- `src/data-utils.js` contains pure logic for data aggregation and transformations.

### Data layer
- `/data/words/`: one JSON file per day, each containing the words added on that particular date.
- `/data/words/index.json`: manifest listing the available daily word files.
- `/data/daily_stats.json`: daily study aggregates.
- Data is fetched with `fetch()` at runtime and kept in memory for the session.

## 4. Module breakdown
### Flashcards module
- Displays one word at a time.
- Front side: French word, grammar label, source pill, and speech button.
- Back side: English, Chinese, sample sentences, and notes.
- Keyboard controls: Space/Enter flips, ArrowLeft/ArrowRight changes card, and `K`/`D` marks known or unknown.
- Mobile support: swipe left/right for movement and tap to flip.

### Dashboard module
- Contribution heat map for the last 365 days.
- Each square corresponds to a date and the count of words added on that day.
- Tooltip displays `YYYY-MM-DD: X words added`.
- Summary table summarizes listening and reading question totals by CEFR level from A1 to C2.

## 5. Data processing
### Question breakdown
The app derives summary counts from vocabulary entries using the `source.type` field:
- `listening` => contributes to `listeningQuestions`
- `reading` => contributes to `readingQuestions`

The app groups by CEFR bands A1–C2 based on the level inferred from the source context or from `daily_stats.json` if provided.

### Heat map
- The data pipeline turns a day-to-word-count map into a 365-day array.
- The earliest day of the year is shown on the left and the newest on the right.
- Color scale:
  - 0 = gray
  - 1–5 = light green
  - 6–10 = green
  - 11+ = dark green

## 6. Accessibility and UX
- Semantic HTML landmarks and button elements.
- Visible focus styles for keyboard navigation.
- Large tap targets for mobile devices.
- Screen-reader-friendly text in the summary and tooltips.

## 7. Testing strategy
- Use Node tests for pure utility functions.
- Validate daily aggregation and heat map generation.
- Verify question summary calculations before rendering UI.

## 8. Deployment
- Deploy static assets to GitHub Pages from the repository root.
- Ensure `index.html`, `styles.css`, `app.js`, and `/data/*.json` are all included in the build output.
