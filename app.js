/*
  Student Names: Aibek Bolatbekuly, Kainar Koshentay, Khamza Ryskul
  Student IDs: 240116030, 240116032, 240116080
  Course: PED 379 — Web Programming
  Section: [Section number]
  Assignment: Midterm 2 Project

  File: app.js — PromptCraft
  Part 2 (Participant 2): client-side form validation and UI state.
  - intercepts submit with event.preventDefault()
  - validates the draft prompt (empty, >= 3 words, <= 300 chars,
    forbidden symbols, profanity) and the selected goal / mode
  - shows custom error and success messages in the page (no alert())
  - when the form is valid it dispatches a "prompt:valid" CustomEvent;
    Participant 3's fetch() code listens for it (see bottom of file)
  Load with:  <script src="app.js" defer></script>
*/

"use strict";

/* ==========================================================
   1. CONFIG
   ========================================================== */
const MIN_WORDS = 3;
const MAX_CHARS = 300;

// Characters that are not allowed in a prompt:  # $ % { } < >
const FORBIDDEN_SYMBOLS = /[#$%{}<>]/g;

// Small English block-list (whole words only, case-insensitive)
const PROFANITY_LIST = [
  "fuck", "fucking", "shit", "bitch", "bastard", "asshole",
  "dick", "cunt", "damn", "crap", "slut", "whore", "nigger", "faggot"
];
const PROFANITY_REGEX = new RegExp(`\\b(${PROFANITY_LIST.join("|")})\\b`, "i");

const ALLOWED_MODES = ["synonyms", "related", "both"];

/* ==========================================================
   2. DOM REFERENCES (found by id — see index.html)
   ========================================================== */
const form = document.getElementById("prompt-form");
const promptInput = document.getElementById("prompt-input");
const goalSelect = document.getElementById("goal-select");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const wordCounter = document.getElementById("word-counter");
const clearButton = document.getElementById("clear-btn");
const formMessage = document.getElementById("form-message");
const ruleChips = document.querySelectorAll("[data-rule]"); // chips under the form
const highlightLayer = document.getElementById("prompt-highlight"); // overlay behind textarea (optional)

// Becomes true after the first submit attempt, so errors are not
// shown while the user is still typing for the first time.
let submitAttempted = false;

/* ==========================================================
   3. HELPERS
   ========================================================== */

/** Remove extra spaces/newlines so "a   b\n c" becomes "a b c". */
function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

/** Number of words in a string. */
function countWords(text) {
  const clean = normalizeText(text);
  return clean === "" ? 0 : clean.split(" ").length;
}

/** Number of forbidden symbols in a string. */
function countForbiddenSymbols(text) {
  const matches = text.match(FORBIDDEN_SYMBOLS);
  return matches ? matches.length : 0;
}

/** Selected radio value (Synonyms / Related / Both) or "". */
function getSelectedMode() {
  const checked = document.querySelector('input[name="mode"]:checked');
  return checked ? checked.value : "";
}

/* ==========================================================
   4. VALIDATION
   Returns { isValid, errors[], stats } — it does NOT touch the DOM,
   so the logic is easy to test and explain.
   ========================================================== */
function validatePrompt(rawText, goal, mode) {
  const errors = [];
  const text = normalizeText(rawText);
  const words = countWords(text);
  const symbols = countForbiddenSymbols(rawText);
  const hasProfanity = PROFANITY_REGEX.test(text);

  // 1. required field
  if (text === "") {
    errors.push({ field: "prompt", message: "Prompt is required — type something first" });
  } else {
    // 2. minimum length in words
    if (words < MIN_WORDS) {
      errors.push({ field: "prompt", message: "Prompt is too short — add some context" });
    }
    // 3. maximum length in characters
    if (rawText.length > MAX_CHARS) {
      errors.push({
        field: "prompt",
        message: `Prompt is too long — ${rawText.length}/${MAX_CHARS} characters`
      });
    }
    // 4. forbidden symbols and profanity (same message as in the design)
    if (symbols > 0 || hasProfanity) {
      errors.push({
        field: "prompt",
        message: "Remove symbols like # $ % { } < > — profanity won’t pass either"
      });
    }
  }

  // 5. context: goal must be chosen
  if (goal === "") {
    errors.push({ field: "goal", message: "Choose a goal for your prompt" });
  }

  // 6. mode must be one of the allowed values
  if (!ALLOWED_MODES.includes(mode)) {
    errors.push({ field: "mode", message: "Choose a suggestion type: Synonyms, Related or Both" });
  }

  return {
    isValid: errors.length === 0,
    errors,
    stats: { text, words, symbols, hasProfanity, chars: rawText.length }
  };
}

/* ==========================================================
   5. UI UPDATES (DOM manipulation)
   textContent is used everywhere instead of innerHTML, so user input
   can never be interpreted as HTML (protection against XSS).
   ========================================================== */

/** Live counter under the textarea: "7 words · 49/300" or "7 symbols". */
function updateCounter() {
  const raw = promptInput.value;
  const words = countWords(raw);
  const symbols = countForbiddenSymbols(raw);

  if (symbols > 0) {
    wordCounter.textContent = `${symbols} ${symbols === 1 ? "symbol" : "symbols"}`;
    wordCounter.classList.add("is-error");
  } else {
    wordCounter.textContent =
      `${words} ${words === 1 ? "word" : "words"} · ${raw.length}/${MAX_CHARS}`;
    wordCounter.classList.toggle("is-error", raw.length > MAX_CHARS);
  }
}

/**
 * Highlights forbidden symbols and profanity inside the text.
 * A transparent layer sits behind the textarea with the same text;
 * only the <mark> elements are visible (red background), so the user
 * sees exactly which characters are wrong — like in the design.
 * Nodes are built with textContent, never innerHTML.
 */
function updateHighlight() {
  if (!highlightLayer) return;
  const raw = promptInput.value;
  const pattern = new RegExp(`([#$%{}<>]|\\b(?:${PROFANITY_LIST.join("|")})\\b)`, "gi");

  highlightLayer.textContent = ""; // clear old content
  raw.split(pattern).forEach((part, index) => {
    if (part === "") return;
    // split() with a capture group puts the matches at odd indexes
    if (index % 2 === 1) {
      const mark = document.createElement("mark");
      mark.textContent = part;
      highlightLayer.appendChild(mark);
    } else {
      highlightLayer.appendChild(document.createTextNode(part));
    }
  });
  // a trailing newline would collapse in the layer, so add an invisible character
  if (raw.endsWith("\n")) highlightLayer.appendChild(document.createTextNode("\u200b"));
  highlightLayer.scrollTop = promptInput.scrollTop;
}

/** Marks the three rule chips (≥ 3 words, no profanity, no symbols). */
function updateRuleChips() {
  const raw = promptInput.value;
  const state = {
    "min-words": countWords(raw) >= MIN_WORDS,
    "no-profanity": !PROFANITY_REGEX.test(raw),
    "no-symbols": countForbiddenSymbols(raw) === 0
  };

  ruleChips.forEach((chip) => {
    const rule = chip.dataset.rule;
    if (!(rule in state)) return;
    // Do not shout in red while the field is still empty.
    const touched = raw !== "";
    chip.classList.toggle("is-ok", touched && state[rule]);
    chip.classList.toggle("is-bad", touched && !state[rule]);
  });
}

/** Clears any previous message and error marks. */
function resetFeedback() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
  formMessage.hidden = true;
  promptInput.classList.remove("is-invalid", "is-valid");
  promptInput.removeAttribute("aria-invalid");
  goalSelect.classList.remove("is-invalid");
  goalSelect.removeAttribute("aria-invalid");
}

/** Shows the red error box and marks the invalid controls. */
function showErrors(errors) {
  resetFeedback();

  errors.forEach((error) => {
    const line = document.createElement("p");
    line.textContent = error.message;
    formMessage.appendChild(line);
  });

  formMessage.classList.add("form-message--error");
  formMessage.setAttribute("role", "alert");
  formMessage.hidden = false;

  const fields = errors.map((e) => e.field);
  if (fields.includes("prompt")) {
    promptInput.classList.add("is-invalid");
    promptInput.setAttribute("aria-invalid", "true");
  }
  if (fields.includes("goal")) {
    goalSelect.classList.add("is-invalid");
    goalSelect.setAttribute("aria-invalid", "true");
  }
}

/** Shows the green success box. */
function showSuccess(message) {
  resetFeedback();
  const line = document.createElement("p");
  line.textContent = message;
  formMessage.appendChild(line);

  formMessage.classList.add("form-message--success");
  formMessage.setAttribute("role", "status");
  formMessage.hidden = false;
  promptInput.classList.add("is-valid");
}

/** Moves the keyboard focus to the first invalid control. */
function focusFirstError(errors) {
  const first = errors[0].field;
  if (first === "goal") goalSelect.focus();
  else if (first === "mode") modeInputs[0].focus();
  else promptInput.focus();
}

/* ==========================================================
   6. EVENT HANDLERS
   ========================================================== */

/** Typing: update counter and chips; re-validate if user already tried to submit. */
function handleInput() {
  updateCounter();
  updateRuleChips();
  updateHighlight();

  if (submitAttempted) {
    const result = validatePrompt(promptInput.value, goalSelect.value, getSelectedMode());
    if (result.isValid) {
      resetFeedback();
    } else {
      showErrors(result.errors);
    }
  }
}

/** Submit: stop the browser reload, validate, then show error or success. */
function handleSubmit(event) {
  event.preventDefault(); // do not reload the page / send the form to a server
  submitAttempted = true;

  const result = validatePrompt(promptInput.value, goalSelect.value, getSelectedMode());

  if (!result.isValid) {
    showErrors(result.errors);
    focusFirstError(result.errors);
    return; // invalid data is NOT processed further
  }

  showSuccess("Prompt accepted — analyzing your vocabulary…");

  // Hand the clean data to the API part (Participant 3).
  document.dispatchEvent(
    new CustomEvent("prompt:valid", {
      detail: {
        prompt: result.stats.text,
        goal: goalSelect.value,
        mode: getSelectedMode()
      }
    })
  );
}

/** Clear button: reset the whole form and its feedback. */
function handleClear() {
  form.reset();
  submitAttempted = false;
  resetFeedback();
  updateCounter();
  updateRuleChips();
  updateHighlight();
  document.dispatchEvent(new CustomEvent("prompt:cleared"));
  promptInput.focus();
}

/** Ctrl/Cmd + Enter submits the form from inside the textarea. */
function handleKeydown(event) {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    form.requestSubmit();
  }
}

/* ==========================================================
   7. INIT — listeners are attached in JS, no inline onclick/onsubmit
   ========================================================== */
function init() {
  if (!form || !promptInput || !goalSelect || !wordCounter || !formMessage) {
    console.warn("PromptCraft: form elements not found — check ids in index.html");
    return;
  }

  form.setAttribute("novalidate", ""); // we show our own messages, not browser bubbles
  formMessage.hidden = true;

  form.addEventListener("submit", handleSubmit);
  promptInput.addEventListener("input", handleInput);
  promptInput.addEventListener("keydown", handleKeydown);
  goalSelect.addEventListener("change", handleInput);
  modeInputs.forEach((radio) => radio.addEventListener("change", handleInput));
  if (clearButton) clearButton.addEventListener("click", handleClear);
  // keep the highlight layer scrolled together with the textarea
  promptInput.addEventListener("scroll", () => {
    if (highlightLayer) highlightLayer.scrollTop = promptInput.scrollTop;
  });

  updateCounter();
  updateRuleChips();
  updateHighlight();
}

init();

/* ==========================================================
   8. HOOK FOR PARTICIPANT 3 (REST API)
   Put this in your part of app.js:

   document.addEventListener("prompt:valid", (event) => {
     const { prompt, goal, mode } = event.detail;
     runAnalysis(prompt, goal, mode);   // fetch() + 4 states
   });
   ========================================================== */
