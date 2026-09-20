# GATE Question Bank

A static Next.js reader for the open [`gecwyd/gate-questions`](https://github.com/gecwyd/gate-questions) archive.

## Data behaviour

This site deliberately uses the question repository as its database. It loads only the directory level a visitor opens, and retrieves a single `final_questions.json` only after that visitor selects a paper. The interface displays ten questions per page.

## Development

```bash
npm install
npm run dev
```

The included GitHub Actions workflow statically exports the site and deploys it to GitHub Pages after each push to `main`.
