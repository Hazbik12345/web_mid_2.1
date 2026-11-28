/*
  Student Names: [Full name 1], [Full name 2], [Full name 3]
  Student IDs: [ID 1], [ID 2], [ID 3]
  Course: PED 379 — Web Programming
  Section: [Section number]
  Assignment: Midterm 2 Project
*/

'use strict';

const API_BASE_URL = 'https://api.datamuse.com/words';
const MAX_KEYWORDS = 4;
const MAX_SUGGESTIONS = 6;
const REQUEST_TIMEOUT_MS = 8000;

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'at',
  'by', 'with', 'about', 'from', 'as', 'is', 'are', 'was', 'be', 'it', 'this',
  'that', 'my', 'me', 'i', 'you', 'your', 'we', 'our', 'can', 'please', 'some'
]);

const MODE_PARAMS = {
  syn: ['rel_syn'],
  related: ['ml'],
  both: ['rel_syn', 'ml']
};

let lastRequest = null;

function extractKeywords(promptText) {
  const words = promptText
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z-]/g, ''))
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));

  return [...new Set(words)].slice(0, MAX_KEYWORDS);
}

async function fetchWords(param, word) {
  const url = `${API_BASE_URL}?${param}=${encodeURIComponent(word)}&max=10`;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Datamuse answered with HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timerId);
  }
}

async function getSuggestionsForKeyword(keyword, mode) {
  const params = MODE_PARAMS[mode] || MODE_PARAMS.both;

  const results = await Promise.all(params.map((param) => fetchWords(param, keyword)));

  const seen = new Set([keyword]);
  const suggestions = [];

  for (const item of results.flat()) {
    if (!seen.has(item.word)) {
      seen.add(item.word);
      suggestions.push({ word: item.word, score: item.score || 0 });
    }
  }

  suggestions.sort((a, b) => b.score - a.score);

  return {
    keyword: keyword,
    suggestions: suggestions.slice(0, MAX_SUGGESTIONS)
  };
}

async function loadSuggestions(promptText, mode = 'both') {
  lastRequest = { promptText, mode };
  const keywords = extractKeywords(promptText);

  if (keywords.length === 0) {
    showState('empty');
    return;
  }

  showState('loading');
  setSubmitDisabled(true);

  try {
    const groups = await Promise.all(
      keywords.map((keyword) => getSuggestionsForKeyword(keyword, mode))
    );

    const groupsWithWords = groups.filter((group) => group.suggestions.length > 0);

    if (groupsWithWords.length === 0) {
      showState('empty');
    } else {
      renderSuggestions(groupsWithWords);
      showState('success');
    }
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'The dictionary took too long to answer. Please try again.'
      : 'Could not reach the Datamuse dictionary. Check your internet connection and try again.';
    showError(message);
  } finally {
    setSubmitDisabled(false);
  }
}

const STATES = ['loading', 'success', 'empty', 'error'];

function showState(stateName) {
  for (const name of STATES) {
    const element = document.getElementById(`state-${name}`);
    if (element) {
      element.hidden = name !== stateName;
    }
  }
}

function showError(message) {
  const errorText = document.getElementById('error-text');
  if (errorText) {
    errorText.textContent = message;
  }
  showState('error');
}

function setSubmitDisabled(isDisabled) {
  const submitButton = document.querySelector('#prompt-form button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = isDisabled;
    submitButton.setAttribute('aria-busy', String(isDisabled));
  }
}

function renderSuggestions(groups) {
  const container = document.getElementById('suggestions');
  const summary = document.getElementById('results-summary');
  container.replaceChildren();

  let total = 0;

  for (const group of groups) {
    const card = document.createElement('article');
    card.className = 'suggestion-group';

    const title = document.createElement('h3');
    title.className = 'suggestion-group__keyword';
    title.textContent = group.keyword;

    const list = document.createElement('ul');
    list.className = 'chips';

    for (const item of group.suggestions) {
      const listItem = document.createElement('li');
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = item.word;
      chip.dataset.keyword = group.keyword;
      chip.dataset.word = item.word;
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', handleChipClick);

      listItem.appendChild(chip);
      list.appendChild(listItem);
      total += 1;
    }

    card.append(title, list);
    container.appendChild(card);
  }

  if (summary) {
    summary.textContent = `Found ${total} suggestions for ${groups.length} keyword(s). Click a word to put it into your prompt.`;
  }
}

function handleChipClick(event) {
  const chip = event.currentTarget;
  const promptInput = document.getElementById('prompt-input');
  if (!promptInput) {
    return;
  }

  const { keyword, word } = chip.dataset;
  const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${safeKeyword}\\b`, 'i');
  promptInput.value = promptInput.value.replace(pattern, word);

  const card = chip.closest('.suggestion-group');
  card.querySelectorAll('.chip').forEach((other) => {
    other.dataset.keyword = word;
    other.setAttribute('aria-pressed', String(other === chip));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const retryButton = document.getElementById('retry-btn');
  if (retryButton) {
    retryButton.addEventListener('click', () => {
      if (lastRequest) {
        loadSuggestions(lastRequest.promptText, lastRequest.mode);
      }
    });
  }
});
