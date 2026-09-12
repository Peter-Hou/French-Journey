# French Journey

A static study tracker for French vocabulary and TCF preparation. The site combines a daily vocabulary flashcard flow with a GitHub-style contribution heat map and a CEFR-based question dashboard.

## Features
- Flashcard deck with French word, translations, examples, and speech playback.
- Daily contribution heat map based on vocabulary additions.
- Listening vs. reading summary by CEFR level (A1–C2).
- Mobile-friendly static layout designed for GitHub Pages deployment.

## Project specs
- [spec_files/project_requirement.md](spec_files/project_requirement.md) — original product requirements.
- [spec_files/technical_design.md](spec_files/technical_design.md) — technical architecture and data model.
- [spec_files/implementation_plan.md](spec_files/implementation_plan.md) — implementation and deployment plan.

## Run locally
From the project root:

```bash
python3 -m http.server 8000
```

Then open:

- http://127.0.0.1:8000/French-Journey/

## Data files
- data/words.json — vocabulary entries and examples.
- data/daily_stats.json — study-day aggregates.
