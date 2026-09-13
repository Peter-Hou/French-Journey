import {
  buildHeatMapData,
  buildLevelTrendData,
  getDailyWordCounts,
  getHeatMapColor,
} from './src/data-utils.js';

const state = {
  words: [],
  dailyCounts: {},
  currentIndex: 0,
  flipped: false,
  activeTab: 'flashcards',
  chartSelection: {
    listening: 'all',
    reading: 'all',
  },
};

const refs = {
  todayWords: document.getElementById('today-words'),
  listeningTotal: document.getElementById('listening-total'),
  readingTotal: document.getElementById('reading-total'),
  heatmap: document.getElementById('heatmap'),
  trendPanels: document.getElementById('trend-panels'),
  flashcard: document.getElementById('flashcard'),
  cardFront: document.getElementById('card-front'),
  cardBack: document.getElementById('card-back'),
  cardInner: document.getElementById('card-inner'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  flipBtn: document.getElementById('flip-btn'),
  speakBtn: document.getElementById('speak-btn'),
};

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

function aggregateDailyStats(dailyStats) {
  const summary = {
    listening: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
    reading: { a1: 0, a2: 0, b1: 0, b2: 0, c1: 0, c2: 0 },
  };

  if (!Array.isArray(dailyStats)) {
    return summary;
  }

  dailyStats.forEach((entry) => {
    LEVELS.forEach((level) => {
      summary.listening[level] += Number(entry.listeningQuestions?.[level] ?? 0);
      summary.reading[level] += Number(entry.readingQuestions?.[level] ?? 0);
    });
  });

  return summary;
}

async function init() {
  try {
    const [wordsIndexResponse, statsResponse] = await Promise.all([
      fetch('./data/words/index.json'),
      fetch('./data/daily_stats.json'),
    ]);

    const dateFiles = await wordsIndexResponse.json();
    const words = [];

    for (const dateFile of dateFiles) {
      const response = await fetch(`./data/words/${dateFile}`);
      const dailyWords = await response.json();
      words.push(...dailyWords);
    }

    const dailyStats = await statsResponse.json();

    state.words = words;
    state.dailyCounts = getDailyWordCounts(words);
    state.dailyStats = dailyStats;

    bindEvents();
    renderDashboard();
    renderFlashcard();
  } catch (error) {
    console.error('Unable to load study data:', error);
    refs.cardFront.innerHTML = '<div class="translation-block"><span class="label">Error</span><span class="value">Could not load vocabulary data.</span></div>';
  }
}

function bindEvents() {
  refs.flipBtn.addEventListener('click', () => {
    state.flipped = !state.flipped;
    renderFlashcard();
  });

  refs.nextBtn.addEventListener('click', () => {
    state.currentIndex = (state.currentIndex + 1) % state.words.length;
    state.flipped = false;
    renderFlashcard();
  });

  refs.prevBtn.addEventListener('click', () => {
    state.currentIndex = (state.currentIndex - 1 + state.words.length) % state.words.length;
    state.flipped = false;
    renderFlashcard();
  });

  refs.speakBtn.addEventListener('click', () => speakCurrentWord());

  refs.flashcard.addEventListener('click', () => {
    state.flipped = !state.flipped;
    renderFlashcard();
  });

  document.addEventListener('click', (event) => {
    const levelToggle = event.target.closest('.level-toggle');
    if (levelToggle) {
      const skill = levelToggle.dataset.skill;
      const level = levelToggle.dataset.level;
      state.chartSelection[skill] = state.chartSelection[skill] === level ? 'all' : level;
      renderDashboard();
      return;
    }

    const tabButton = event.target.closest('.tab-button');
    if (tabButton) {
      state.activeTab = tabButton.dataset.tab;
      renderTabs();
      return;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      state.flipped = !state.flipped;
      renderFlashcard();
    }

    if (event.key === 'ArrowRight') {
      state.currentIndex = (state.currentIndex + 1) % state.words.length;
      state.flipped = false;
      renderFlashcard();
    }

    if (event.key === 'ArrowLeft') {
      state.currentIndex = (state.currentIndex - 1 + state.words.length) % state.words.length;
      state.flipped = false;
      renderFlashcard();
    }

    if (event.key.toLowerCase() === 'k') {
      state.currentIndex = (state.currentIndex + 1) % state.words.length;
      state.flipped = false;
      renderFlashcard();
    }

    if (event.key.toLowerCase() === 'd') {
      state.currentIndex = (state.currentIndex - 1 + state.words.length) % state.words.length;
      state.flipped = false;
      renderFlashcard();
    }
  });

  let touchStartX = 0;
  refs.flashcard.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  refs.flashcard.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;

    if (Math.abs(delta) < 30) {
      state.flipped = !state.flipped;
      renderFlashcard();
      return;
    }

    if (delta > 0) {
      state.currentIndex = (state.currentIndex - 1 + state.words.length) % state.words.length;
    } else {
      state.currentIndex = (state.currentIndex + 1) % state.words.length;
    }

    state.flipped = false;
    renderFlashcard();
  });
}

function renderTabs() {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === state.activeTab);
  });

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${state.activeTab}`);
  });
}

function renderDashboard() {
  const summary = aggregateDailyStats(state.dailyStats);
  const totalListening = Object.values(summary.listening).reduce((sum, value) => sum + value, 0);
  const totalReading = Object.values(summary.reading).reduce((sum, value) => sum + value, 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayEntry = state.dailyStats.find((entry) => entry.date === todayKey);
  const todayWords = todayEntry ? Number(todayEntry.wordsAddedCount ?? 0) : (state.dailyCounts[todayKey] ?? 0);

  refs.todayWords.textContent = todayWords;
  refs.listeningTotal.textContent = totalListening;
  refs.readingTotal.textContent = totalReading;

  const heatMapData = buildHeatMapData(state.dailyCounts, todayKey);
  refs.heatmap.innerHTML = heatMapData.map((day) => {
    const cellClass = getHeatMapColor(day.count);
    return `<span
      class="heatmap-cell ${cellClass}"
      title="${day.date}: ${day.count} words added"
      aria-label="${day.date}: ${day.count} words added"
      ></span>`;
  }).join('');

  refs.trendPanels.innerHTML = ['listening', 'reading'].map((skill) => renderTrendChart(skill)).join('');
}

function renderTrendChart(skill) {
  const selectedLevel = state.chartSelection[skill];
  const series = buildLevelTrendData(state.dailyStats, `${skill}Questions`).filter((line) => {
    return selectedLevel === 'all' || line.level === selectedLevel;
  });

  const labels = (state.dailyStats ?? []).map((entry) => entry.date);
  const maxY = Math.max(
    ...series.flatMap((line) => line.points.map((point) => point.value)),
    1,
  );

  const width = 620;
  const height = 210;
  const left = 42;
  const top = 18;
  const chartHeight = height - top - 36;
  const chartWidth = width - left - 26;

  const pathFor = (points) => points.map((point, index) => {
    const x = left + (index / Math.max(points.length - 1, 1)) * chartWidth;
    const y = top + chartHeight - (point.value / maxY) * chartHeight;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const xTicks = labels.length > 0 ? labels.filter((_, index) => 
    index === 0 || index === labels.length - 1 || index % Math.ceil(labels.length / 4) === 0
  ) : [];

  return `
    <div class="trend-card">
      <div class="trend-header">
        <h3>${skill === 'listening' ? 'Listening questions' : 'Reading questions'}</h3>
        <div class="level-toggle-group">
          <button class="level-toggle ${selectedLevel === 'all' ? 'active' : ''}" data-skill="${skill}" data-level="all" type="button">All</button>
          ${LEVELS.map((level) => `
            <button class="level-toggle ${selectedLevel === level ? 'active' : ''}" data-skill="${skill}" data-level="${level}" type="button">${level.toUpperCase()}</button>
          `).join('')}
        </div>
      </div>
      <svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${skill} question trend chart">
        <g class="axis">
          <line x1="${left}" y1="${top + chartHeight}" x2="${width - 20}" y2="${top + chartHeight}" stroke="rgba(148,163,184,0.7)" />
          <line x1="${left}" y1="${top}" x2="${left}" y2="${top + chartHeight}" stroke="rgba(148,163,184,0.7)" />
        </g>
        ${Array.from({ length: 4 }, (_, index) => {
          const value = Math.round((maxY / 3) * index);
          const y = top + chartHeight - (value / maxY) * chartHeight;
          return `
            <g>
              <line x1="${left}" y1="${y}" x2="${width - 20}" y2="${y}" stroke="rgba(148,163,184,0.18)" />
              <text x="8" y="${y + 4}" fill="rgba(226,232,240,0.8)" font-size="10">${value}</text>
            </g>
          `;
        }).join('')}
        ${series.map((line) => `
          <path d="${pathFor(line.points)}" fill="none" stroke="${line.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${line.points.map((point, index) => {
            const x = left + (index / Math.max(line.points.length - 1, 1)) * chartWidth;
            const y = top + chartHeight - (point.value / maxY) * chartHeight;
            return `<circle cx="${x}" cy="${y}" r="3" fill="${line.color}" />`;
          }).join('')}
        `).join('')}
        ${xTicks.map((date, index) => {
          const x = left + ((labels.indexOf(date)) / Math.max(labels.length - 1, 1)) * chartWidth;
          return `<text x="${x}" y="${height - 8}" fill="rgba(226,232,240,0.8)" font-size="10" text-anchor="middle">${date.slice(5)}</text>`;
        }).join('')}
      </svg>
    </div>
  `;
}

function renderFlashcard() {
  if (!state.words.length) {
    refs.cardFront.innerHTML = '<div class="translation-block"><span class="label">No data</span><span class="value">Add vocabulary entries to begin learning.</span></div>';
    refs.cardBack.innerHTML = '';
    return;
  }

  const word = state.words[state.currentIndex];
  const examples = Array.isArray(word.examples) ? word.examples : [];

  refs.cardFront.innerHTML = `
    <div class="card-header">
      <span class="gender-tag">${word.gender ? word.gender.toUpperCase() : 'WORD'}</span>
    </div>
    <div class="word-title">${word.word}</div>
    <div class="translation-block">
      <span class="label">Tag</span>
      <span class="value">${(word.tags ?? []).join(', ') || 'general'}</span>
    </div>
    <div class="translation-block">
      <span class="label">Pronunciation</span>
      <span class="value">Tap the speaker or use the keyboard</span>
    </div>
  `;

  refs.cardBack.innerHTML = `
    <div class="card-header">
      <span class="gender-tag">${word.gender ? word.gender.toUpperCase() : 'WORD'}</span>
    </div>
    <div class="translation-block">
      <span class="label">English</span>
      <span class="value">${word.english || '—'}</span>
    </div>
    <div class="translation-block">
      <span class="label">Chinese</span>
      <span class="value">${word.chinese || '—'}</span>
    </div>
    <div class="examples">
      ${examples.map((example) => `
        <div class="example-box">
          <div class="sentence">${example.french || '—'}</div>
          <div class="translation">${example.english || '—'}</div>
        </div>
      `).join('') || '<div class="example-box"><div class="sentence">No example sentence yet.</div></div>'}
    </div>
  `;

  refs.cardInner.classList.toggle('is-flipped', state.flipped);
}

function speakCurrentWord() {
  if (!state.words.length || !('speechSynthesis' in window)) {
    return;
  }

  const word = state.words[state.currentIndex];
  const utterance = new SpeechSynthesisUtterance(word.word);
  utterance.lang = 'fr-FR';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

init();
