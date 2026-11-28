# AGENTS.md — instructions for AI assistants

This file tells any AI assistant (GitHub Copilot, Claude, ChatGPT…) how to help with this project. Every team member uses these rules when working with AI.

## Project context

- **Project:** PromptCraft, an AI literacy trainer for students (PED 379 — Web Programming, Midterm 2).
- **Idea:** the user enters a weak English prompt. The app finds keywords and suggests synonyms and related terms from the Datamuse API.
- **Team:** 3 students. Every student must be able to explain and modify every line in an oral defense. Help us learn; do not just hand us solutions.

## Hard technical rules

- Use only standard HTML5, CSS3 and vanilla ES6+ JavaScript.
- No React, Vue, Bootstrap, Tailwind, jQuery or any other framework or library.
- No npm packages and no build tools.
- Keep the file structure exactly as is: `index.html`, `styles.css`, `app.js`, `README.md`, `AGENTS.md`, `assets/images/`. Do not add extra files to the repository.
- Put all styles in `styles.css`. No inline `style=""` and no `<style>` blocks in HTML.
- Use semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. Every form control has a `<label for="…">` that matches its `id`. Every meaningful image has a descriptive `alt`.
- Lay out with Flexbox or CSS Grid. Keep at least one mobile media query.
- Use `addEventListener` only. Never use inline handlers like `onclick=""` or `onsubmit=""`.
- Form submission must be intercepted with `event.preventDefault()`.
- Validation (section 1) never inserts user text with `innerHTML`; messages use `textContent`.
- If JavaScript changes the textarea value (for example, a suggestion chip is clicked), dispatch an `input` event afterwards so the counter, rule chips and highlighting update:
  `promptInput.value = newText; promptInput.dispatchEvent(new Event("input"));`
- Talk to the API with `fetch()` + `async/await` + `try/catch`, parse the response with `response.json()`, and always check `response.ok`.
- Show four visible request states: loading, success, empty, error.
- Insert API data with `textContent` / `createElement`, never `innerHTML`.
- The app must run with no syntax errors and no unhandled console errors.

## Security rules

- Never put API keys, tokens or passwords in code, comments, commits or examples.
- Datamuse does not need a key. If a suggestion requires a key, stop and tell us instead.
- `.env` files are git-ignored and must never be committed.

## Code style

Every source file starts with this header, using the comment syntax of its file type:

```
Student Names: [Full names]
Student IDs: [Student IDs]
Course: PED 379 — Web Programming
Section: [Section number]
Assignment: Midterm 2 Project
```

- 2-space indentation, `const`/`let` (never `var`), descriptive English names (`loadSuggestions`, not `ls`).
- Short comments that explain *why*, written for a student reader.
- Prefer simple, readable code over clever one-liners. We have to explain it out loud.

## Shared contract between sections

**Section 1 → Section 2 (validation to API).** Section 1 (`app.js`, validation) never calls the API itself. When the form is valid, it dispatches a custom event:

```js
document.dispatchEvent(new CustomEvent("prompt:valid", {
  detail: { prompt, goal, mode }   // prompt is trimmed, spaces normalized
}));
```

Section 2 (`app.js`, API) listens for it and starts the request:

```js
document.addEventListener("prompt:valid", (event) => {
  const { prompt, mode } = event.detail;
  loadSuggestions(prompt, mode);
});
```

- `mode` is `'synonyms'`, `'related'` or `'both'` (these are the `value` attributes of the radio buttons).
- `goal` is `'study'`, `'work'` or `'creative'` (the `value` of the select).
- Section 1 also dispatches `prompt:cleared` when the Clear button is pressed. Section 2 should hide old results when it receives it.

**Required element IDs / attributes in `index.html`** (do not rename without updating both HTML and JS):

| Used by | Element |
|---|---|
| Section 1 (validation) | `#prompt-form`, `#prompt-input`, `#prompt-highlight`, `#goal-select`, `#word-counter`, `#clear-btn`, `#form-message` |
| Section 1 (validation) | radio buttons with `name="mode"` and values `synonyms` / `related` / `both` |
| Section 1 (validation) | rule chips with `data-rule="min-words"`, `data-rule="no-profanity"`, `data-rule="no-symbols"` |
| Section 2 (API) | `#suggestions`, `#results-summary` |
| Section 2 (API) | `#state-loading`, `#state-success`, `#state-empty`, `#state-error` |
| Section 2 (API) | `#error-text`, `#retry-btn` |

**CSS classes set by JavaScript** (Participant 1 must style them): `.is-invalid`, `.is-valid`, `.form-message--error`, `.form-message--success`, `.is-ok`, `.is-bad`, `.is-error`, and the `[hidden]` attribute.

## How the AI should answer

- Explain what the code does and why, in plain language, before or after showing it.
- For bugs, point to the cause and the line first, then suggest the fix.
- Keep changes small and focused on the file and section we are working on.
- If a request conflicts with these rules, say so instead of breaking them.

## Prompt log

We record the main prompts we gave to AI tools here. This supports the AI disclosure in README.md.

| Date | Member | Tool | Prompt (short) | Used for |
|---|---|---|---|---|
| 2026-11-23 | [Name] | Claude | "Design a website for PromptCraft (dark, terminal style), then a brighter version, then a calmer version, in English" | Design mockups and states |
| 2026-11-28 | [Name] | Claude | "Help with part 3: Datamuse fetch with async/await, try/catch, four states, README and AGENTS" | API section of `app.js`, docs draft |
| 2026-11-28 | [Name 2] | Claude | "Part 2: write JS for form validation (preventDefault, min 3 words, forbidden symbols, profanity, custom error/success messages) following the Midterm 2 requirements and the design" | Section 1 of `app.js` (validation) |
| 2026-11-28 | [Name 2] | Claude | "Make a test index.html and styles.css, highlight forbidden symbols in the textarea, write defense Q&A" | Test page, highlight overlay, defense preparation |
| 2026-11-28 | [Name 2] | Claude | "Where do we put the API key?" / "Check our README and AGENTS.md against my JS" | Security explanation, docs consistency |
| [date] | [Name] | [tool] | [prompt] | [result] |
