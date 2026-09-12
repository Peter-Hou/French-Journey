import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDailyWordCounts,
  summarizeQuestionBreakdown,
  buildHeatMapData,
} from '../src/data-utils.js';

test('counts words by date added', () => {
  const words = [
    { dateAdded: '2026-09-12' },
    { dateAdded: '2026-09-12' },
    { dateAdded: '2026-09-11' },
  ];

  const result = getDailyWordCounts(words);

  assert.deepEqual(result, {
    '2026-09-11': 1,
    '2026-09-12': 2,
  });
});

test('summarizes question breakdowns by skill and level', () => {
  const words = [
    { source: { type: 'listening', test: 1, question: 1 } },
    { source: { type: 'reading', test: 2, question: 2 } },
    { source: { type: 'listening', test: 3, question: 3 } },
    { source: { type: 'reading', test: 5, question: 5 } },
  ];

  const result = summarizeQuestionBreakdown(words);

  assert.equal(result.listening.a1, 1);
  assert.equal(result.reading.a2, 1);
  assert.equal(result.listening.b1, 1);
  assert.equal(result.reading.b2, 1);
});

test('builds a 365-day heatmap from the word counts', () => {
  const counts = {
    '2026-09-12': 11,
    '2026-09-11': 5,
    '2026-09-10': 0,
  };

  const result = buildHeatMapData(counts, '2026-09-12');

  assert.equal(result.length, 365);
  assert.equal(result[0].count, 0);
  assert.equal(result[result.length - 1].count, 0);
  assert.equal(result[364].count, 11);
  assert.equal(result[363].count, 5);
});
