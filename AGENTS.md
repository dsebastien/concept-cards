# AGENTS.md - Concepts Website Maintenance Guide

## Project Overview

Static website built with React 19, TypeScript, Bun, Tailwind CSS v4, React Router (HashRouter), React Icons.

Features: grid/list views, full-text search, category/tag filtering, command palette (`/` or `Ctrl+K`), concept modals, responsive design.

## Project Structure

```
concept-cards/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, AppLayout
│   │   ├── concepts/        # concept-card, concept-detail-modal, concepts-filter, command-palette, concept-icon
│   │   └── ui/              # Reusable UI components
│   ├── data/
│   │   ├── concepts/        # Individual concept JSON files (concept-id.json)
│   │   ├── categories.json
│   │   ├── index.ts
│   │   ├── resources.json
│   │   └── socials.json
│   ├── types/concept.ts
│   ├── lib/utils.ts
│   ├── pages/home.tsx
│   ├── styles/index.css
│   └── main.tsx
├── public/assets/images/
│   ├── social-card-template.svg
│   └── social-cards/{concepts,tags,categories,pages}/
├── scripts/
│   ├── generate-sitemap.ts
│   ├── generate-social-images.ts
│   ├── verify-concept.ts
│   ├── sync-concepts-db.ts
│   ├── init-concepts-db.ts
│   ├── merge-duplicates.ts
│   └── find-duplicates.ts
└── .github/workflows/
```

## Claude Code Skills (MANDATORY)

**Use skills when relevant - they override generic instructions.**

| Skill                      | Invoke                      | Use When                                                      |
| -------------------------- | --------------------------- | ------------------------------------------------------------- |
| `manage-concepts-db`       | `/manage-concepts-db`       | ALL concept operations: add, update, verify, merge duplicates |
| `fetch-public-notes`       | `/fetch-public-notes`       | Fetching content from notes.dsebastien.net                    |
| `add-wikipedia-references` | `/add-wikipedia-references` | Adding Wikipedia links to concepts                            |

## Adding a New Concept

**MANDATORY**: Use `/manage-concepts-db` skill before adding ANY concept.

### Concept JSON Schema

File: `/src/data/concepts/{concept-id}.json` (filename must match `id`)

```json
{
    "id": "concept-id",
    "name": "Concept Name",
    "summary": "One-sentence summary",
    "explanation": "Detailed explanation. What, how, why.",
    "tags": ["tag1", "tag2"],
    "category": "Category Name",
    "icon": "FaBrain",
    "featured": false,
    "aliases": ["Alt Name"],
    "relatedConcepts": ["other-concept-id"],
    "relatedNotes": ["https://notes.dsebastien.net/..."],
    "articles": [{ "title": "Title", "url": "https://...", "type": "website" }],
    "books": [
        { "title": "Book by Author", "url": "https://www.amazon.com/dp/ASIN?tag=dsebastien00-20" }
    ],
    "references": [{ "title": "Title", "url": "https://...", "type": "paper" }],
    "tutorials": [{ "title": "Title", "url": "https://...", "type": "video" }],
    "datePublished": "YYYY-MM-DD",
    "dateModified": "YYYY-MM-DD"
}
```

### Required Fields

| Field           | Format                        |
| --------------- | ----------------------------- |
| `id`            | lowercase, hyphenated         |
| `name`          | Display name                  |
| `summary`       | One sentence                  |
| `explanation`   | Multi-paragraph               |
| `tags`          | Array of strings              |
| `category`      | Must exist in categories.json |
| `featured`      | boolean                       |
| `datePublished` | YYYY-MM-DD                    |
| `dateModified`  | YYYY-MM-DD                    |

### Optional Fields

`icon`, `aliases`, `relatedConcepts`, `relatedNotes`, `articles`, `books`, `references`, `tutorials`

### Reference Types

`paper`, `website`, `video`, `podcast`, `other`

### Book Links (MANDATORY: Amazon Affiliate)

Format: `https://www.amazon.com/dp/[ASIN]?tag=dsebastien00-20`

### Tag Rules

- Hyphenated: `well-being`, `systems-thinking`
- Plural: `strategies` not `strategy`, `businesses` not `business`
- Exceptions (singular): gerunds (`brainstorming`), uncountable (`knowledge`), fields (`psychology`)
- Check existing tags first:
    ```bash
    grep -h '"tags"' src/data/concepts/*.json | tr ',' '\n' | tr -d '[]"' | sed 's/^[[:space:]]*//' | sort -u
    ```

### Date Fields

- New concepts: set both to today
- Updates: only update `dateModified` for substantive changes
- Never modify `datePublished`

### Finalize Concept Changes (MANDATORY)

After adding or updating ANY concept, run:

```bash
bun run fix-concepts
```

This script:

- Adds affiliate product links to book references
- Fixes concept cross-references (validates `relatedConcepts`)
- Populates missing date fields

### Social Images

After adding/renaming/removing concepts:

```bash
bun run generate-social-images
```

Delete orphaned images manually for renamed/removed concepts.

## Categories

| Category                   | Description                |
| -------------------------- | -------------------------- |
| Methods                    | Note-taking/PKM methods    |
| Systems                    | Complete PKM systems       |
| Tools                      | Tool-related concepts      |
| Principles                 | Fundamental principles     |
| Techniques                 | Specific techniques        |
| Frameworks                 | Organizational frameworks  |
| Cognitive Biases           | Thinking errors            |
| Psychology & Mental Models | Psychological concepts     |
| Philosophy & Wisdom        | Philosophical concepts     |
| Well-Being & Happiness     | Mental health/well-being   |
| Decision Science           | Decision-making frameworks |
| Business & Economics       | Business concepts          |
| Leadership & Management    | Leadership concepts        |
| Learning & Education       | Learning strategies        |
| Writing & Content Creation | Writing techniques         |
| Attention & Focus          | Attention management       |
| Communication              | Communication skills       |
| Thinking                   | Cognitive approaches       |
| Software Development       | Software concepts          |
| Productivity               | Productivity concepts      |
| AI                         | AI concepts                |
| Journaling                 | Journaling practices       |
| Concepts                   | General (minimize use)     |

Category assignment: Check specialized categories first. Use `Concepts` only as last resort.

## Icons

Set `icon` field to React-icon name (e.g., `FaBrain`, `FaLightbulb`) or URL.

Pre-imported icons in `concept-icon.tsx`:

- Concept: `FaLightbulb`, `FaBrain`, `FaBook`, `FaBookOpen`, `FaSitemap`, `FaProjectDiagram`, `FaLink`, `FaCubes`, `FaLayerGroup`, `FaNetworkWired`, `FaAtom`, `FaPuzzlePiece`, `FaCogs`, `FaCompass`, `FaDatabase`, `FaStream`, `FaTags`
- Social: `FaGithub`, `FaYoutube`, `FaLinkedin`, `FaXTwitter`, `FaThreads`, `SiObsidian`, `SiSubstack`, `SiBluesky`

Fallback: category-based emoji.

To add icons: import in `concept-icon.tsx`, add to `iconMap`.

## Development Commands

```bash
bun install           # Install dependencies
bun run dev           # Start dev server
bun run build         # Build for production
bun run preview       # Preview production build
bun run lint          # Lint code
bun run format        # Format code
bun run tsc           # Type check
```

## Deployment

```bash
bun run release       # Create and push release tag
```

Auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## URL Structure

Hash-based routing for GitHub Pages:

- Homepage: `https://concepts.dsebastien.net/`
- Concept: `https://concepts.dsebastien.net/#/concept/{concept-id}`
- Filters: `https://concepts.dsebastien.net/?category=Methods&tags=note-taking`

## Visual Debugging

**MANDATORY** for layout/CSS changes: use Claude in Chrome MCP.

```
1. bun run dev
2. mcp__claude-in-chrome__tabs_context_mcp (createIfEmpty: true)
3. mcp__claude-in-chrome__navigate to http://localhost:XXXX/
4. mcp__claude-in-chrome__resize_window (320x800, 480x800, 768x1024, 1280x800)
5. mcp__claude-in-chrome__computer (action: screenshot)
```

## Styling

Tailwind CSS v4. Theme variables in `/src/styles/index.css`:

```css
@theme {
    --color-primary: #ffffff;
    --color-secondary: #e5007d;
    --color-secondary-text: #ff1493;
    --color-background: #37404c;
}
```

## Troubleshooting

| Issue                       | Solution                               |
| --------------------------- | -------------------------------------- |
| Build type errors           | `bun run tsc`                          |
| Styles not updating         | Restart dev server                     |
| Concept not appearing       | Verify JSON valid, filename matches id |
| Command palette not opening | Check not focused on input             |
| Icons not displaying        | Verify icon name in `iconMap`          |
