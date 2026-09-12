import unittest

from src.data_utils import get_daily_word_counts, summarize_question_breakdown, build_heat_map_data, build_level_trend_data


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

    def test_builds_level_trend_data(self):
        stats = [
            {"date": "2026-09-10", "listeningQuestions": {"a1": 1, "a2": 0, "b1": 0, "b2": 0, "c1": 0, "c2": 0}, "readingQuestions": {"a1": 0, "a2": 0, "b1": 0, "b2": 0, "c1": 0, "c2": 0}},
            {"date": "2026-09-11", "listeningQuestions": {"a1": 2, "a2": 0, "b1": 0, "b2": 0, "c1": 0, "c2": 0}, "readingQuestions": {"a1": 0, "a2": 0, "b1": 0, "b2": 0, "c1": 0, "c2": 0}},
        ]

        result = build_level_trend_data(stats, "listeningQuestions")

        self.assertEqual(result[0]["level"], "a1")
        self.assertEqual(result[0]["points"][0]["value"], 1)
        self.assertEqual(result[0]["points"][1]["value"], 2)


if __name__ == "__main__":
    unittest.main()
