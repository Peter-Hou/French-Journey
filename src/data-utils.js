export const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

const LEVEL_BY_TEST = {
  1: 'a1',
  2: 'a2',
  3: 'b1',
  4: 'b1',
  5: 'b2',
  6: 'b2',
  7: 'c1',
  8: 'c1',
  9: 'c2',
  10: 'c2',
};

const FALLBACK_LEVEL_ORDER = {
  listening: ['a1', 'b1', 'c1'],
  reading: ['a2', 'b2', 'c2'],
};

export function getDailyWordCounts(words) {
  const counts = {};

  words.forEach((word) => {
    const dateValue = word.dateAdded;
    if (!dateValue) return;
    counts[dateValue] = (counts[dateValue] ?? 0) + 1;
  });

  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

export function inferLevelFromTest(testNumber, sourceType, occurrenceIndex) {
  if (testNumber !== undefined && testNumber !== null && !Number.isNaN(Number(testNumber))) {
    const normalized = Number(testNumber);
    return LEVEL_BY_TEST[normalized] ?? 'a1';
  }

  const fallbackLevels = FALLBACK_LEVEL_ORDER[sourceType] ?? ['a1'];
  return fallbackLevels[occurrenceIndex % fallbackLevels.length];
}

export function summarizeQuestionBreakdown(words) {
  const summary = {
    listening: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
    reading: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
  };
  const occurrenceCounts = { listening: 0, reading: 0 };

  words.forEach((word) => {
    const source = word.source ?? {};
    const type = source.type;
    if (!summary[type]) return;

    const level = inferLevelFromTest(source.test, type, occurrenceCounts[type]);
    summary[type][level] += 1;
    occurrenceCounts[type] += 1;
  });

  return summary;
}

export function buildHeatMapData(counts, endDateText) {
  const endDate = new Date(`${endDateText}T12:00:00Z`);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 364);

  const result = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const isoDate = current.toISOString().slice(0, 10);
    result.push({
      date: isoDate,
      count: counts[isoDate] ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export function getHeatMapColor(count) {
  if (count === 0) return 'heatmap-empty';
  if (count >= 1 && count <= 5) return 'heatmap-level-1';
  if (count >= 6 && count <= 10) return 'heatmap-level-2';
  return 'heatmap-level-3';
}
