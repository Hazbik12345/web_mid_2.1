# AGENTS.md — instructions for AI assistants

This file tells any AI assistant (GitHub Copilot, Claude, ChatGPT…) how to help with this project. Every team member uses these rules when working with AI.

## Project context

- **Project:** PromptCraft, an AI literacy trainer for students (PED 379 — Web Programming, Midterm 2).
- **Idea:** the user enters a weak English prompt. The app finds keywords and suggests synonyms and related terms from the Datamuse API.
- **Team:** 3 students. Every student must be able to **explain and modify every line** in an oral defense. Help us learn; do not just hand us solutions.

## Hard technical rules

1. Use **only** standard HTML5, CSS3 and vanilla ES6+ JavaScript.
   - No React, Vue, Bootstrap, Tailwind, jQuery or any other framework or library.
   - No npm packages and no build tools.
2. Keep the file structure exactly as is: `index.html`, `styles.css`, `app.js`, `README.md`, `AGENTS.md`, `assets/images/`.
3. Put **all styles in `styles.css`**. No inline `style=""` and no `<style>` blocks in HTML.
4. Use **semantic HTML**: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. Every form control has a `<label for="…">` that matches its `id`. Every meaningful image has a descriptive `alt`.
5. Lay out with **Flexbox or CSS Grid**. Keep at least one mobile **media query**.
6. Use **`addEventListener` only**. Never use inline handlers like `onclick=""` or `onsubmit=""`.
7. Form submission must be intercepted with **`event.preventDefault()`**.
8. Talk to the API with **`fetch()` + `async/await` + `try/catch`**, parse the response with `response.json()`, and always check `response.ok`.
9. Show four visible request states: **loading, success, empty, error**.
10. Insert API data with **`textContent` / `createElement`**, never `innerHTML`.
11. The app must run with **no syntax errors and no unhandled console errors**.

## Security rules

- **Never** put API keys, tokens or passwords in code, comments, commits or examples.
- Datamuse does not need a key. If a suggestion requires a key, stop and tell us instead.
- `.env` files are git-ignored and must never be committed.

## Code style

- Every source file starts with this header, using the comment syntax of its file type:
  ```
  Student Names: [Full names]
  Student IDs: [Student IDs]
  Course: PED 379 — Web Programming
  Section: [Section number]
  Assignment: Midterm 2 Project
  ```
- 2-space indentation, `const`/`let` (never `var`), descriptive English names (`loadSuggestions`, not `ls`).
- Short comments that explain **why**, written for a student reader.
- Prefer simple, readable code over clever one-liners. We have to explain it out loud.

## Shared contract between sections

- `app.js` section 1 (validation, Participant 2) calls `loadSuggestions(promptText, mode)` from section 2 when the prompt is valid. `mode` is `'syn'`, `'related'` or `'both'`.
- Required element IDs in `index.html`:
  - `#prompt-form`
  - `#prompt-input`
  - `#suggestions`
  - `#results-summary`
  - `#state-loading`, `#state-success`, `#state-empty`, `#state-error`
  - `#error-text`
  - `#retry-btn`
- Do not rename these IDs without updating both HTML and JS.

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
| [date] | [Name] | [tool] | [prompt] | [result] |
