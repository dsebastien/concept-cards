---
name: manage-concepts-db
description: Manage the concepts database - verify, add, update, and check for duplicates before modifying concepts. MANDATORY for all concept operations.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task
---

# Manage Concepts Database

**MANDATORY for ALL concept operations**: add, update, verify, merge duplicates, sync.

## Core Rules

1. **ALWAYS verify before adding** - run verification BEFORE creating JSON
2. **ALWAYS sync after changes** - run sync AFTER modifying concepts
3. **≥90% confidence = STOP** - review suggested duplicates
4. **70-89% confidence = REVIEW** - manually compare matches
5. **<70% confidence = PROCEED** with caution

## Scripts Reference

| Script | Command | When |
|--------|---------|------|
| verify-concept.ts | `npx tsx scripts/verify-concept.ts --name "Name" --summary "Summary"` | BEFORE adding |
| sync-concepts-db.ts | `npx tsx scripts/sync-concepts-db.ts` | AFTER any change |
| find-duplicates.ts | `npx tsx scripts/find-duplicates.ts --threshold 80` | Periodic cleanup |
| merge-duplicates.ts | `npx tsx scripts/merge-duplicates.ts --source ID --target ID --strategy merge-fields` | Merge confirmed duplicates |
| init-concepts-db.ts | `npx tsx scripts/init-concepts-db.ts` | Database rebuild |

## Quick Workflow: Add Single Concept

### Step 1: Quick Check (5s)
```bash
grep -ri "CONCEPT_NAME" src/data/concepts/ 2>/dev/null | head -5
```
If matches → stop, verify manually.

### Step 2: Database Verify (10s)
```bash
npx tsx scripts/verify-concept.ts --name "Concept Name" --summary "Brief summary"
```

### Step 3: Find Related Notes
```bash
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*KEYWORD*.md" 2>/dev/null | grep -v ".smart-env" | head -5
```
Convert path to URL: spaces→`+`, remove `.md`, prefix `https://notes.dsebastien.net/`

### Step 4: Find Related Articles
```bash
for f in $(grep -ril "KEYWORD" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/"*.md 2>/dev/null | grep -v "(Draft)"); do
  grep -m1 "^title:" "$f" | sed 's/title: //'
  grep -m1 "^url:" "$f" | sed 's/url: //'
done
```

### Step 5: Create Concept JSON
```json
{
    "id": "concept-id",
    "name": "Concept Name",
    "summary": "One-sentence summary",
    "explanation": "Detailed explanation.",
    "tags": ["tag1", "tag2"],
    "category": "Category",
    "icon": "FaLightbulb",
    "featured": false,
    "aliases": [],
    "relatedConcepts": [],
    "relatedNotes": [],
    "references": [{"title": "Name - Wikipedia", "url": "https://en.wikipedia.org/wiki/...", "type": "website"}],
    "articles": [],
    "books": [],
    "tutorials": [],
    "datePublished": "YYYY-MM-DD",
    "dateModified": "YYYY-MM-DD"
}
```

### Step 6: Sync Database
```bash
npx tsx scripts/sync-concepts-db.ts
```

## Bulk Concept Addition (Parallel)

For 10+ concepts, use sub-agents:

```
Task tool (subagent_type="general-purpose"):
"Create concept JSON for [NAME]:
1. Read source note at [PATH] if available
2. Generate explanation if source thin
3. Search related notes in /home/dsebastien/notesSeb/30 Areas/ (32.02 or 33.02 Content)
4. Search related articles in .../33.04 Creations/Articles/ (skip Draft)
5. Create JSON at src/data/concepts/[id].json
6. Add Wikipedia reference if available"
```

After all complete:
```bash
npx tsx scripts/sync-concepts-db.ts
npm run build 2>&1 | tail -5
```

## Merge Duplicates

```bash
# Review both
cat src/data/concepts/{source-id}.json
cat src/data/concepts/{target-id}.json

# Merge (combines tags, aliases, references; deletes source)
npx tsx scripts/merge-duplicates.ts --source {source-id} --target {target-id} --strategy merge-fields
npx tsx scripts/sync-concepts-db.ts
```

## URL Construction: Related Notes

```
File: /home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.02 Content/Note Name.md
URL:  https://notes.dsebastien.net/30+Areas/33+Permanent+notes/33.02+Content/Note+Name
```

Rules: spaces→`+`, remove `.md`, path starts `30+Areas/...`

## Category Assignment

| Concept Type | Category |
|--------------|----------|
| Cognitive bias | `Cognitive Biases` |
| Psychological | `Psychology & Mental Models` |
| Philosophical | `Philosophy & Wisdom` |
| Well-being | `Well-Being & Happiness` |
| Decision-making | `Decision Science` |
| Business | `Business & Economics` |
| Leadership | `Leadership & Management` |
| Learning | `Learning & Education` |
| Writing | `Writing & Content Creation` |
| Focus/attention | `Attention & Focus` |
| Communication | `Communication` |
| Thinking | `Thinking` |
| Software | `Software Development` |
| Productivity | `Productivity` |
| AI | `AI` |
| PKM method | `Methods` |
| Complete system | `Systems` |
| Principle | `Principles` |
| Technique | `Techniques` |
| Framework | `Frameworks` |
| Journaling | `Journaling` |
| Other | `Concepts` (minimize) |

## Tag Rules

- **Plural**: `strategies`, `businesses`, `decisions`
- **Exceptions (singular)**: gerunds (`brainstorming`), uncountable (`knowledge`), fields (`psychology`)
- **Hyphenated**: `well-being`, `systems-thinking`

Check existing:
```bash
grep -h '"tags"' src/data/concepts/*.json | tr ',' '\n' | tr -d '[]"' | sed 's/^[[:space:]]*//' | sort -u
```

## Cross-References

```bash
# Find by tag
grep -l '"TAGNAME"' src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//'

# Find by category
grep -l '"category": "CATEGORY"' src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//'

# Find by keyword
grep -l 'KEYWORD' src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//'
```

Add cross-references in both directions via `relatedConcepts` array.

## List Existing Concepts

```bash
# Count
ls src/data/concepts/*.json | wc -l

# IDs
ls src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//' | sort

# Names
grep -h '"name"' src/data/concepts/*.json | sed 's/.*"name": "//;s/".*//' | sort

# Tags
grep -h '"tags"' src/data/concepts/*.json | tr ',' '\n' | tr -d '[]"' | sed 's/^[[:space:]]*//' | sort -u

# Categories
grep -h '"category"' src/data/concepts/*.json | sed 's/.*"category": "//;s/".*//' | sort -u
```

## Generate Concept ID

```bash
echo "Parkinson's Law" | tr '[:upper:]' '[:lower:]' | sed "s/'//g" | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g'
# → parkinsons-law
```

## Database Maintenance

```bash
# Stats
sqlite3 concepts.db "SELECT (SELECT COUNT(*) FROM concepts) as concepts, (SELECT COUNT(*) FROM concept_aliases) as aliases, (SELECT COUNT(*) FROM concept_tags) as tags;"

# Rebuild
rm concepts.db && npx tsx scripts/init-concepts-db.ts
```

## Handling Light Source Content

When source note is thin (1-2 sentences):
- Generate comprehensive explanation using your knowledge
- Cover: what, how, why, when to apply
- Add relevant references (Wikipedia, books, papers)
- Still link source note in `relatedNotes`

Skip concept only if:
- Just a quote (no actionable concept)
- Confirmed duplicate
- Person/book name without conceptual content
- Article reference, not a concept
