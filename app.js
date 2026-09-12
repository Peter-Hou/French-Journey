import {
  buildHeatMapData,
  getDailyWordCounts,
  getHeatMapColor,
  summarizeQuestionBreakdown,
} from './src/data-utils.js';

const state = {
  words: [],
  dailyCounts: {},
  currentIndex: 0,
  flipped: false,
};

const refs = {
  todayWords: document.getElementById('today-words'),
  listeningTotal: document.getElementById('listening-total'),
  readingTotal: document.getElementById('reading-total'),
  heatmap: document.getElementById('heatmap'),
  summaryBody: document.getElementById('question-summary-body'),
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

function renderDashboard() {
  const summary = summarizeQuestionBreakdown(state.words);
  const totalListening = Object.values(summary.listening).reduce((sum, value) => sum + value, 0);
  const totalReading = Object.values(summary.reading).reduce((sum, value) => sum + value, 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayWords = state.dailyCounts[todayKey] ?? 0;

  refs.todayWords.textContent = todayWords;
  refs.listeningTotal.textContent = totalListening;
  refs.readingTotal.textContent = totalReading;

  refs.summaryBody.innerHTML = LEVELS.map((level) => `
    <tr>
      <td>${level.toUpperCase()}</td>
      <td>${summary.listening[level] ?? 0}</td>
      <td>${summary.reading[level] ?? 0}</td>
    </tr>
  `).join('');

  const heatMapData = buildHeatMapData(state.dailyCounts, todayKey);
  refs.heatmap.innerHTML = heatMapData.map((day) => {
    const cellClass = getHeatMapColor(day.count);
    return `<span
      class="heatmap-cell ${cellClass}"
      title="${day.date}: ${day.count} words added"
      aria-label="${day.date}: ${day.count} words added"
      ></span>`;
  }).join('');
}

function renderFlashcard() {
  if (!state.words.length) {
    refs.cardFront.innerHTML = '<div class="translation-block"><span class="label">No data</span><span class="value">Add vocabulary entries to begin learning.</span></div>';
    refs.cardBack.innerHTML = '';
    return;
  }

  const word = state.words[state.currentIndex];
  const source = word.source ?? {};
  const sourceLabel = source.type === 'listening' ? `🎧 Test ${source.test || 1} - Q${source.question || 1}` : `📖 Test ${source.test || 1} - Q${source.question || 1}`;
  const examples = Array.isArray(word.examples) ? word.examples : [];

  refs.cardFront.innerHTML = `
    <div class="card-header">
      <span class="source-pill">${sourceLabel}</span>
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
      <span class="source-pill">${sourceLabel}</span>
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
