import unittest

from src.data_utils import get_daily_word_counts, summarize_question_breakdown, build_heat_map_data


class DataUtilsTests(unittest.TestCase):
    def test_counts_words_by_date_added(self):
        words = [
            {"dateAdded": "2026-09-12"},
            {"dateAdded": "2026-09-12"},
            {"dateAdded": "2026-09-11"},
        ]

        result = get_daily_word_counts(words)

        self.assertEqual(result, {"2026-09-11": 1, "2026-09-12": 2})

    def test_summarizes_question_breakdown_by_skill_and_level(self):
        words = [
            {"source": {"type": "listening"}},
            {"source": {"type": "reading"}},
            {"source": {"type": "listening"}},
            {"source": {"type": "reading"}},
        ]

        result = summarize_question_breakdown(words)

        self.assertEqual(result["listening"]["a1"], 1)
        self.assertEqual(result["reading"]["a2"], 1)
        self.assertEqual(result["listening"]["b1"], 1)
        self.assertEqual(result["reading"]["b2"], 1)

    def test_builds_heatmap_data_for_a_full_year(self):
        counts = {"2026-09-12": 11, "2026-09-11": 5, "2026-09-10": 0}

        result = build_heat_map_data(counts, "2026-09-12")

        self.assertEqual(len(result), 365)
        self.assertEqual(result[0]["count"], 0)
        self.assertEqual(result[-1]["count"], 11)
        self.assertEqual(result[-2]["count"], 5)


if __name__ == "__main__":
    unittest.main()
