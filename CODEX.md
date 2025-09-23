# CODEX.md

Guidance for Codex (GitHub Copilot / OpenAI CLI) when working in this repository.

## Asset Generation
- Use `python scripts/image-creator.py "<prompt>" --transparent` to generate placeholder icons or UI imagery. The script reads `GEMINI_API_KEY` from `.env` automatically and saves assets into the `images/` directory by default.
- Prefer `--transparent` for UI icons so they integrate cleanly with light/dark themes. Provide a descriptive prompt that references the Beli brand style (teal accents, minimal premium aesthetic).
- When creating list-related placeholders, target replacing the emoji fallback in `beli-native/src/components/lists/ListCard.tsx`.

## Development Notes
- Activate the virtual environment with `source .venv/bin/activate` before running tooling that depends on `google-genai`.
- Be mindful of `.gitignore` entries (`.env`, `.venv/`) when adding credentials or environment-specific files.
