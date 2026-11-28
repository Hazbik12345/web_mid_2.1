# PromptCraft — AI literacy trainer

**Course:** PED 379 — Web Programming · **Assignment:** Midterm 2 Project · **Section:** [Section number]

PromptCraft is a student web app that teaches how to write better prompts for AI tools. You paste a weak draft prompt (for example, *"explain photosynthesis simply for my biology test"*). The app finds the vague keywords and suggests stronger synonyms and related terms from a free dictionary API. Click a suggestion to put it into your prompt.

**Target users:** students who use ChatGPT, Claude, Copilot and similar tools for studying and want clearer, more specific answers.

- **Live demo:** [GitHub Pages link — add after deploy]
- **Repository:** [GitHub repository link]
- **Design (Canva):** [Canva link or exported design in `assets/images/`]

---

## Features

- **Prompt analysis form.** Labelled textarea, prompt goal select and suggestion-type options (synonyms / related / both).
- **Client-side validation.** Submission is intercepted with `event.preventDefault()`. A prompt must have at least 3 words and no profanity or junk symbols (`# $ % { } < >`…). Custom error messages appear on the page.
- **Live REST API data.** Keywords are extracted from the prompt, and suggestions are fetched from Datamuse with `fetch()` + `async/await`.
- **Four visible request states:**
  - **Loading:** "Analyzing your vocabulary…" and the submit button is disabled.
  - **Success:** suggestion chips are grouped by keyword.
  - **Empty:** the API returned `[]` (for example, for `asdasd`), so "No improvements found" with tips.
  - **Error:** network failure, HTTP error or timeout, caught with `try/catch`, with a **Retry** button.
- **Interactive chips.** Clicking a suggestion replaces the keyword in your prompt.
- **Responsive layout.** Built with Flexbox/Grid and a mobile media query.

## Setup

No build step, no dependencies, no API key.

1. Clone the repository:
   ```bash
   git clone [repository URL]
   cd [repository folder]
   ```
2. Open `index.html` in a browser, or use the VS Code **Live Server** extension. An internet connection is needed for the API.

**To test the error state:** open DevTools → **Network** → set throttling to **Offline**, then submit the form.

## Project structure

```
project-root/
├── index.html      # semantic markup, form, result containers
├── styles.css      # all styles (Flexbox/Grid, states, media query)
├── app.js          # validation (section 1) + API integration (section 2)
├── README.md
├── AGENTS.md       # instructions for AI assistants used in this project
├── .gitignore
└── assets/
    └── images/
```

## API information

| | |
|---|---|
| **API** | [Datamuse API](https://www.datamuse.com/api/) |
| **Auth** | None — no API key required |
| **Endpoints used** | `GET https://api.datamuse.com/words?rel_syn={word}&max=10` (synonyms)<br>`GET https://api.datamuse.com/words?ml={word}&max=10` (related terms, "means like") |
| **Response** | JSON array: `[{ "word": "clarify", "score": 2245 }, …]`; empty array `[]` when nothing is found |
| **Language** | English vocabulary only, so prompts should be written in English |
| **Limits** | Free, up to 100,000 requests per day without a key |

**How the app uses it (`app.js`, section 2):**

1. `extractKeywords()` lowercases the prompt, removes stop words ("for", "my", "the"…) and keeps up to 4 keywords.
2. `fetchWords()` sends one `fetch()` request. It checks `response.ok`, because `fetch` does not throw on 404/500. It parses JSON with `response.json()` and cancels the request after 8 seconds with `AbortController`.
3. `getSuggestionsForKeyword()` runs the requests in parallel with `Promise.all`, merges them, removes duplicates and sorts by score.
4. `loadSuggestions()` is the main function. It shows the loading state, waits for all keywords, then shows success, empty or error. The `try/catch/finally` re-enables the button in every case.
5. `renderSuggestions()` builds the chips with `createElement` and `textContent`, not `innerHTML`, so API data can never inject HTML.

### Security

- Datamuse needs **no API key**, so there are no secrets in this repository.
- `.gitignore` excludes `.env` files, in case a keyed API is added later.
- Before submission we checked the code and the commit history:
  `git grep -i -E "api[_-]?key|token|secret|password"` and `git log -p | grep -i -E "api[_-]?key|token|secret"`. Neither found anything.
- Note: a key placed in front-end JavaScript is visible to anyone in DevTools. A keyed API would need a small server-side proxy.

## Team and roles

| Member | Student ID | Role | Main files |
|---|---|---|---|
| [Full name 1] | [ID] | Canva design, semantic HTML5, responsive CSS3 | `index.html`, `styles.css`, Canva |
| [Full name 2] | [ID] | Form validation, event handling, UI messages | `app.js` (section 1) |
| [Full name 3] | [ID] | REST API integration, 4 states, security, README & AGENTS | `app.js` (section 2), `README.md`, `AGENTS.md` |

### Individual contributions (see commit history)

- **[Full name 1]:** [e.g. "Canva layout desktop + mobile", "index.html structure", "form styles", "mobile media query" — link commits]
- **[Full name 2]:** [e.g. "preventDefault submit handler", "word-count and symbol validation", "custom error messages" — link commits]
- **[Full name 3]:** [e.g. "fetchWords with response.ok check", "four-state switching", "chip rendering", "README / AGENTS" — link commits]

All members tested the app and prepared for the defense together.

## AI assistance disclosure

We used AI assistants during this project. Everything they produced was reviewed, tested and edited by us, and every member can explain and modify each part of the code.

| Area | AI tool | What the AI did | What we did ourselves |
|---|---|---|---|
| Planning | Claude (Anthropic) | Suggested the split of tasks between three members and a requirements checklist | Chose the project idea, agreed on roles, adjusted the plan |
| Design | Claude (Anthropic) | Generated several design concepts and mockups (desktop, mobile, form/API states) that we used as reference | Chose the final direction, asked for changes (colors, fonts, language), recreated the design in Canva |
| Coding — API section (`app.js` section 2) | Claude (Anthropic) | Drafted the fetch / async-await / try-catch logic, the four-state switching and the chip rendering, with comments | Read and understood every line, tested all four states (including Offline mode), connected it to our HTML and validation |
| Coding — other files | [GitHub Copilot / Claude / none] | [describe, e.g. "autocompleted CSS properties"] | [describe] |
| Documentation | Claude (Anthropic) | Drafted the structure of README.md and AGENTS.md | Filled in our names, roles, links and checked every statement |
| Debugging | [tool] | [describe] | [describe] |

The instructions we gave to AI tools are recorded in [AGENTS.md](AGENTS.md).
