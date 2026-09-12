from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from typing import Any, Dict, List

LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]
LEVEL_BY_TEST = {
    1: "a1",
    2: "a2",
    3: "b1",
    4: "b1",
    5: "b2",
    6: "b2",
    7: "c1",
    8: "c1",
    9: "c2",
    10: "c2",
}
FALLBACK_LEVEL_ORDER = {
    "listening": ["a1", "b1", "c1"],
    "reading": ["a2", "b2", "c2"],
}


def get_daily_word_counts(words: List[Dict[str, Any]]) -> Dict[str, int]:
    counts: Dict[str, int] = defaultdict(int)
    for word in words:
        date_value = word.get("dateAdded")
        if date_value:
            counts[date_value] += 1
    return dict(sorted(counts.items()))


def _get_test_level(test_number: Any, source_type: str, occurrence_index: int) -> str:
    if test_number is not None:
        try:
            level = LEVEL_BY_TEST.get(int(test_number), "a1")
            return level if level in LEVELS else "a1"
        except (TypeError, ValueError):
            pass

    fallback_levels = FALLBACK_LEVEL_ORDER.get(source_type, ["a1"])
    return fallback_levels[occurrence_index % len(fallback_levels)]


def summarize_question_breakdown(words: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
    summary = {"listening": {level: 0 for level in LEVELS}, "reading": {level: 0 for level in LEVELS}}
    occurrence_counts = {"listening": 0, "reading": 0}

    for word in words:
        source = word.get("source", {})
        source_type = source.get("type")
        if source_type not in summary:
            continue

        test_number = source.get("test")
        level = _get_test_level(test_number, source_type, occurrence_counts[source_type])
        summary[source_type][level] += 1
        occurrence_counts[source_type] += 1

    return summary


def build_heat_map_data(counts: Dict[str, int], end_date_text: str) -> List[Dict[str, Any]]:
    try:
        end_date = date.fromisoformat(end_date_text)
    except ValueError as exc:
        raise ValueError(f"Invalid ISO date: {end_date_text}") from exc

    start_date = end_date - timedelta(days=364)
    data: List[Dict[str, Any]] = []
    current = start_date

    while current <= end_date:
        iso_date = current.isoformat()
        data.append({
            "date": iso_date,
            "count": counts.get(iso_date, 0),
        })
        current += timedelta(days=1)

    return data


def build_level_trend_data(daily_stats: List[Dict[str, Any]], skill: str) -> List[Dict[str, Any]]:
    if not isinstance(daily_stats, list) or not skill:
        return []

    return [
        {
            "level": level,
            "color": {
                "a1": "#60a5fa",
                "a2": "#34d399",
                "b1": "#fbbf24",
                "b2": "#f472b6",
                "c1": "#a78bfa",
                "c2": "#fb7185",
            }[level],
            "points": [
                {"date": entry.get("date"), "value": int(entry.get(skill, {}).get(level, 0))}
                for entry in daily_stats
            ],
        }
        for level in LEVELS
    ]
