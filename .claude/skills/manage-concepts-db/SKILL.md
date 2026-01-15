---
name: manage-concepts-db
description: Manage the concepts database - verify, add, update, and check for duplicates before modifying concepts. MANDATORY for all concept operations.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task
---

# Manage Concepts Database

This skill provides workflows for working with the concepts SQLite database to prevent duplicates and maintain data quality.

**IMPORTANT**: This skill MUST be used for ALL concept operations:
- Adding new concepts
- Updating existing concepts
- Checking for duplicates
- Syncing the database
- Merging duplicates

Invoke with `/manage-concepts-db` or follow the workflows below.

## MANDATORY RULES

1. **ALWAYS verify before adding a new concept**
   - Use Quick Check (Step 1) FIRST for fast preliminary screening
   - Run `npx tsx scripts/verify-concept.ts` BEFORE creating any new concept JSON file
   - Minimum 90% confidence that concept doesn't exist
   - If confidence ≥70%, manually review potential duplicates

2. **ALWAYS update database after concept changes**
   - After adding/editing concept JSON: run `npx tsx scripts/sync-concepts-db.ts`
   - Database must stay in sync with JSON files

3. **NEVER skip duplicate checks**
   - Even if you think it's unique, run verification
   - All checks are logged for audit trail

## QUICK CHECK: Fast Pre-Verification (Use First!)

Before running the database verification script, use these fast checks to catch obvious duplicates instantly:

### Quick Check with Grep (Instant)

```bash
# Check if concept name exists (case-insensitive)
grep -ri "\"name\".*CONCEPT_NAME" /home/dsebastien/wks/concept-cards/src/data/concepts/ 2>/dev/null

# Check if concept exists as an alias
grep -ri "\"aliases\".*CONCEPT_NAME" /home/dsebastien/wks/concept-cards/src/data/concepts/ 2>/dev/null

# Check for similar names (partial match)
grep -ri "KEYWORD" /home/dsebastien/wks/concept-cards/src/data/concepts/*.json 2>/dev/null | grep -i "name\|alias"
```

### Quick Check with Glob (File exists?)

```bash
# Check if concept file already exists
ls /home/dsebastien/wks/concept-cards/src/data/concepts/CONCEPT-ID.json 2>/dev/null
```

### Example Quick Check Session

```bash
# Want to add "Pomodoro Technique"?
grep -ri "pomodoro" /home/dsebastien/wks/concept-cards/src/data/concepts/ 2>/dev/null
# If matches found → likely duplicate, verify manually
# If no matches → proceed to database verification
```

## Available Scripts

All scripts are TypeScript and should be invoked with `npx tsx`:

| Script                      | Purpose                                        | When to Use                         |
| --------------------------- | ---------------------------------------------- | ----------------------------------- |
| `init-concepts-db.ts`       | Initialize and populate database               | First time setup or rebuild         |
| `verify-concept.ts`         | Check if concept exists before adding          | BEFORE creating any new concept     |
| `sync-concepts-db.ts`       | Sync database with JSON files                  | AFTER adding/editing any concept    |
| `merge-duplicates.ts`       | Merge duplicate concepts                       | When duplicates confirmed           |
| `find-duplicates.ts`        | Scan all concepts for potential duplicates     | Periodic cleanup / data quality     |

## Workflow: Adding a New Concept

### Step 1: Verify Concept Doesn't Exist

```bash
npx tsx scripts/verify-concept.ts \
  --name "Concept Name" \
  --summary "Brief summary" \
  --aliases "Alias 1,Alias 2" \
  --related-notes "https://notes.dsebastien.net/..."
```

**Interpret Results:**
- **Confidence ≥90%**: STOP - concept likely exists. Review suggested duplicates.
- **Confidence 70-89%**: REVIEW manually. Check suggested duplicates. Decide if truly different.
- **Confidence <70%**: PROCEED with caution. Log decision reasoning.

### Step 2: If Approved, Create Concept JSON

Only proceed if confidence <90% OR you've manually verified it's unique.

Create `/home/dsebastien/wks/concept-cards/src/data/concepts/{id}.json` following schema in AGENTS.md.

### Step 3: Sync Database

```bash
npx tsx scripts/sync-concepts-db.ts
```

Verify concept was added to database successfully.

## Workflow: Updating an Existing Concept

### Step 1: Edit Concept JSON

Make changes to `/home/dsebastien/wks/concept-cards/src/data/concepts/{id}.json`

### Step 2: Sync Database

```bash
npx tsx scripts/sync-concepts-db.ts
```

Database will automatically update based on content hash change.

## Workflow: Merging Duplicates

### Step 1: Identify Duplicates

```bash
# Scan all concepts for duplicates
npx tsx scripts/find-duplicates.ts --threshold 80
```

### Step 2: Review and Decide

- Compare concepts side-by-side
- Decide which to keep (target) and which to merge (source)
- Choose merge strategy

### Step 3: Execute Merge

```bash
npx tsx scripts/merge-duplicates.ts \
  --source {source-id} \
  --target {target-id} \
  --strategy merge-fields
```

This will:
- Combine data from both concepts
- Update cross-references
- Delete source JSON file
- Update database

### Step 4: Sync Database

```bash
npx tsx scripts/sync-concepts-db.ts
```

### Step 5: Verify

```bash
# Check target concept exists
cat /home/dsebastien/wks/concept-cards/src/data/concepts/{target-id}.json

# Check source concept deleted
ls /home/dsebastien/wks/concept-cards/src/data/concepts/{source-id}.json  # should error
```

## Common Scenarios

### Scenario 1: User Asks to Add Concepts from MoC

1. For EACH concept to add:
   - Run `verify-concept.ts` with name and summary
   - If confidence <90%, proceed with creation
   - If confidence ≥90%, inform user of existing concept and ask if they want to update it instead
   - After creating concept, run `sync-concepts-db.ts`

2. Run final sync after all concepts added:
   ```bash
   npx tsx scripts/sync-concepts-db.ts
   ```

### Scenario 2: Bulk Import from Multiple MoCs

1. Create a temporary script that:
   - Reads each MoC note
   - For each potential concept, calls `verify-concept.ts`
   - Logs all HIGH confidence duplicates
   - Only creates LOW/MEDIUM confidence concepts
   - Outputs report of skipped duplicates

2. Review report with user
3. Manually handle high-confidence duplicates
4. Run final sync

### Scenario 3: User Reports Duplicate Concepts

1. Run similarity check:
   ```bash
   npx tsx scripts/verify-concept.ts --name "Concept Name" --summary "..."
   ```

2. If duplicates confirmed, merge:
   ```bash
   npx tsx scripts/merge-duplicates.ts --source {id1} --target {id2} --strategy merge-fields
   npx tsx scripts/sync-concepts-db.ts
   ```

## Database Maintenance

### Check Database Health

```bash
# View database stats
sqlite3 /home/dsebastien/wks/concept-cards/concepts.db "
  SELECT
    (SELECT COUNT(*) FROM concepts) as total_concepts,
    (SELECT COUNT(*) FROM concept_aliases) as total_aliases,
    (SELECT COUNT(*) FROM concept_tags) as total_tags,
    (SELECT COUNT(*) FROM duplicate_checks) as total_checks;
"
```

### Rebuild Database from JSON

If database gets corrupted or out of sync:

```bash
# Delete database
rm /home/dsebastien/wks/concept-cards/concepts.db

# Reinitialize
npx tsx scripts/init-concepts-db.ts
```

## Troubleshooting

**Issue**: verify-concept.ts shows false positives

**Solution**: Adjust similarity thresholds in script. Review and tune weights.

**Issue**: Database out of sync with JSON files

**Solution**: Run `npx tsx scripts/sync-concepts-db.ts`

**Issue**: Need to force-add concept despite high confidence match

**Solution**: Add `--force` flag to skip duplicate check (use sparingly, document why)

## FINDING RELEVANT PUBLIC NOTES TO LINK

When adding concepts, **ALWAYS** check for relevant public notes to add to the concept's `relatedNotes` array.

**Use the `fetch-public-notes` skill** (`/fetch-public-notes`) for detailed instructions on fetching content from the public notes website.

### Notes Locations (Local Repository)

```
/home/dsebastien/notesSeb/30 Areas/32 Literature notes/32.02 Content/     # Literature notes
/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.02 Content/     # Permanent notes
```

### Step 1: Search for Relevant Notes

```bash
# Search for notes containing the concept keyword
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*.md" -path "*/32.02 Content/*" -o -path "*/33.02 Content/*" 2>/dev/null | xargs grep -li "CONCEPT_KEYWORD" 2>/dev/null | head -10

# Or search by filename
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*KEYWORD*.md" 2>/dev/null | grep -v ".smart-env"
```

### Step 2: Construct Public URL

Convert file path to public URL:
- Base URL: `https://notes.dsebastien.net/`
- Replace spaces with `+`
- Remove `.md` extension
- Path starts from `30+Areas/...`

**Example:**
```
File: /home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.02 Content/Positive psychology.md
URL:  https://notes.dsebastien.net/30+Areas/33+Permanent+notes/33.02+Content/Positive+psychology
```

### Step 3: Add to Concept's relatedNotes Array

```json
{
  "relatedNotes": [
    "https://notes.dsebastien.net/30+Areas/33+Permanent+notes/33.02+Content/Note+Name"
  ]
}
```

### Quick One-Liner: Find Notes and Generate URLs

```bash
# Find notes and generate public URLs
for f in $(find /home/dsebastien/notesSeb/30\ Areas -type f -name "*.md" \( -path "*/32.02 Content/*" -o -path "*/33.02 Content/*" \) 2>/dev/null | xargs grep -li "KEYWORD" 2>/dev/null); do
  basename "$f" .md
  echo "$f" | sed 's|/home/dsebastien/notesSeb/|https://notes.dsebastien.net/|' | sed 's|\.md$||' | sed 's| |+|g'
  echo ""
done
```

---

## FINDING RELEVANT ARTICLES TO LINK

When adding concepts, **ALWAYS** check for relevant articles from the Obsidian vault to add to the concept's `articles` array.

### Articles Location

```
/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/
```

**Skip files with " (Draft)" suffix** - these are unpublished.

### Step 1: Search for Relevant Articles

```bash
# Search for articles containing the concept keyword (case-insensitive)
grep -ril "CONCEPT_KEYWORD" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/"*.md 2>/dev/null | grep -v "(Draft)" | head -10

# Alternative: Search article titles/filenames
ls "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/" | grep -i "KEYWORD" | grep -v "(Draft)"
```

### Step 2: Extract URL from Frontmatter

For each relevant article found, extract the `url` and `title` from frontmatter:

```bash
# Extract url from a specific article file
grep -m1 "^url:" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/ARTICLE_FILENAME.md" | sed 's/url: //'

# Extract title from a specific article file
grep -m1 "^title:" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/ARTICLE_FILENAME.md" | sed 's/title: //'
```

### Step 3: Add to Concept's Articles Array

Add the article reference to the concept JSON:

```json
{
  "articles": [
    {
      "title": "Article Title Here",
      "url": "https://www.dsebastien.net/article-slug/",
      "type": "website"
    }
  ]
}
```

### Quick One-Liner: Find Articles and Extract URLs

```bash
# Find articles matching keyword and show their URLs
for f in $(grep -ril "KEYWORD" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/"*.md 2>/dev/null | grep -v "(Draft)"); do
  echo "=== $(basename "$f") ==="
  grep -m1 "^title:" "$f" | sed 's/title: //'
  grep -m1 "^url:" "$f" | sed 's/url: //'
  echo ""
done
```

### Example: Finding Articles for "Zettelkasten" Concept

```bash
# Search for zettelkasten-related articles
for f in $(grep -ril "zettelkasten" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/"*.md 2>/dev/null | grep -v "(Draft)"); do
  echo "=== $(basename "$f") ==="
  grep -m1 "^title:" "$f" | sed 's/title: //'
  grep -m1 "^url:" "$f" | sed 's/url: //'
  echo ""
done
```

**Result might show:**
```
=== What is a Zettelkasten and How to Set One Up (Article).md ===
title: What is a Zettelkasten and How to Set One Up
url: https://www.dsebastien.net/what-is-a-zettelkasten/
```

Then add to concept:
```json
{
  "articles": [
    {
      "title": "What is a Zettelkasten and How to Set One Up",
      "url": "https://www.dsebastien.net/what-is-a-zettelkasten/",
      "type": "website"
    }
  ]
}
```

---

## CROSS-REFERENCING CONCEPTS

When adding new concepts, always check for related concepts to link:

### Find Related Concepts

```bash
# Find concepts with similar tags
grep -l '"TAGNAME"' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//'

# Find concepts in same category
grep -l '"category": "CATEGORY_NAME"' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//'

# Find concepts mentioning a keyword in explanation
grep -l 'KEYWORD' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//'
```

### Add Cross-References

1. Add new concept ID to existing concepts' `relatedConcepts` arrays
2. Add existing concept IDs to new concept's `relatedConcepts` array

```bash
# Example: Add "parkinsons-law" to "time-boxing" concept
# Edit time-boxing.json and add "parkinsons-law" to relatedConcepts array
```

---

## COMMON CATEGORY ASSIGNMENTS

| Concept Type | Category |
|--------------|----------|
| Cognitive bias (thinking error) | `Cognitive Biases` |
| Psychological phenomenon | `Psychology & Mental Models` |
| Philosophy/wisdom concept | `Philosophy & Wisdom` |
| Happiness/well-being practice | `Well-Being & Happiness` |
| Decision-making framework | `Decision Science` |
| Business/economics concept | `Business & Economics` |
| Leadership concept | `Leadership & Management` |
| Learning/memory technique | `Learning & Education` |
| Writing technique | `Writing & Content Creation` |
| Focus/attention method | `Attention & Focus` |
| Communication skill | `Communication` |
| Thinking approach | `Thinking` |
| Software concept | `Software Development` |
| Productivity method | `Productivity` |
| AI-related concept | `AI` |
| Note-taking/PKM method | `Methods` |
| Complete system | `Systems` |
| General principle | `Principles` |
| Specific technique | `Techniques` |
| Organizational framework | `Frameworks` |
| Journal practice | `Journaling` |
| Other | `Concepts` |

---

## TAG GUIDELINES (IMPORTANT!)

**Always pluralize tags** (with few exceptions):

| ✓ Correct | ✗ Incorrect |
|-----------|-------------|
| `strategies` | `strategy` |
| `businesses` | `business` |
| `careers` | `career` |
| `decisions` | `decision` |
| `innovations` | `innovation` |

**Exceptions (keep singular)**:
- Gerunds: `brainstorming`, `teaching`, `investing`
- Uncountable: `knowledge`, `wisdom`, `progress`
- Fields: `psychology`, `sociology`, `epistemology`

**Use hyphens for multi-word tags**: `well-being`, `critical-thinking`, `systems-thinking`

---

## Documentation References

- **Implementation plan**: `/home/dsebastien/wks/concept-cards/documentation/plans/sqlite-duplicate-detection-plan.md`
- **Database reference**: `/home/dsebastien/wks/concept-cards/documentation/plans/concepts-database.md`
- **AGENTS.md**: Complete concept schema and guidelines

## Key Principles

1. **Prevention over correction**: Always verify BEFORE creating
2. **Automatic sync**: Run sync after every change
3. **Audit trail**: All verification checks are logged
4. **Conservative thresholds**: 90%+ confidence = reject
5. **User control**: High-confidence matches require user decision

## EFFICIENT SINGLE CONCEPT ADDITION

Use this streamlined workflow for adding individual concepts:

### Step 1: Quick Check (5 seconds)

```bash
# Replace CONCEPT_NAME with actual name
grep -ri "CONCEPT_NAME" /home/dsebastien/wks/concept-cards/src/data/concepts/ 2>/dev/null | head -5
```

**If matches found**: Stop and verify manually. May be a duplicate.
**If no matches**: Proceed to Step 2.

### Step 2: Database Verification (10 seconds)

```bash
npx tsx scripts/verify-concept.ts --name "Concept Name" --summary "Brief summary"
```

**If confidence ≥90%**: STOP - concept likely exists
**If confidence <90%**: Proceed to Step 3

### Step 3: Find Related Notes (Use `/fetch-public-notes` skill)

**ALWAYS check for relevant public notes** to add to `relatedNotes`:

```bash
# Search for related notes
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*KEYWORD*.md" 2>/dev/null | grep -v ".smart-env" | head -5

# Generate public URL from file path
# File: .../33 Permanent notes/33.02 Content/Note Name.md
# URL: https://notes.dsebastien.net/30+Areas/33+Permanent+notes/33.02+Content/Note+Name
```

### Step 4: Find Related Articles (10 seconds)

**ALWAYS check for relevant articles from the Obsidian vault:**

```bash
# Search for articles related to the concept
for f in $(grep -ril "CONCEPT_KEYWORD" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/"*.md 2>/dev/null | grep -v "(Draft)"); do
  echo "=== $(basename "$f") ==="
  grep -m1 "^title:" "$f" | sed 's/title: //'
  grep -m1 "^url:" "$f" | sed 's/url: //'
done
```

If articles found, add them to the concept's `articles` array.

### Step 5: Create Concept JSON

Use this template (copy and customize):

```json
{
    "id": "concept-id",
    "name": "Concept Name",
    "summary": "A brief one-sentence summary",
    "explanation": "Detailed explanation of what the concept is, how it works, and why it's useful.",
    "tags": ["tag1", "tag2"],
    "category": "Concepts",
    "icon": "FaLightbulb",
    "featured": false,
    "aliases": [],
    "relatedConcepts": [],
    "relatedNotes": [],
    "references": [
        {
            "title": "Reference Name - Wikipedia",
            "url": "https://en.wikipedia.org/wiki/Reference",
            "type": "website"
        }
    ],
    "articles": [],
    "books": [],
    "tutorials": [],
    "datePublished": "YYYY-MM-DD",
    "dateModified": "YYYY-MM-DD"
}
```

**ID Format**: lowercase, hyphenated (e.g., `parkinsons-law`)
**Date Format**: ISO 8601 (e.g., `2025-01-15`)

### Step 6: Sync Database

```bash
npx tsx scripts/sync-concepts-db.ts
```

---

## EFFICIENT BULK CONCEPT ADDITION (Parallel Sub-Agents)

When adding multiple concepts (e.g., from a MoC), use this parallelized approach:

### Option A: Sequential (Simple, 5-10 concepts)

Process one at a time using the single concept workflow above.

### Option B: Parallel Sub-Agents (10+ concepts)

**Step 1**: Identify all concepts to add and verify in bulk:

```bash
# List all potential concept names
echo "Concept 1
Concept 2
Concept 3" | while read concept; do
  echo "=== Checking: $concept ==="
  grep -ri "$concept" /home/dsebastien/wks/concept-cards/src/data/concepts/ 2>/dev/null | head -2
done
```

**Step 2**: For confirmed unique concepts, spawn sub-agents:

```
For each concept (run in parallel):
  Task tool with subagent_type="general-purpose"
  Prompt: "Create concept JSON for [CONCEPT_NAME]:
    1. Research: Read source note if available at [PATH]
    2. Generate explanation using your knowledge if source is thin
    3. Search for related public notes in /home/dsebastien/notesSeb/30 Areas/ (32.02 Content or 33.02 Content folders)
       - Add found notes to relatedNotes array as public URLs (https://notes.dsebastien.net/30+Areas/...)
    4. Search for related articles in /home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/ (skip Draft files)
       - Add found articles to articles array (extract title and url from frontmatter)
    5. Create JSON at /home/dsebastien/wks/concept-cards/src/data/concepts/[id].json
    6. Use today's date for datePublished and dateModified
    7. Add Wikipedia reference if available"
```

**Step 3**: After all sub-agents complete:

```bash
# Sync all new concepts to database
npx tsx scripts/sync-concepts-db.ts

# Verify build
npm run build 2>&1 | tail -5
```

---

## LIST ALL EXISTING CONCEPTS

Quick reference commands:

```bash
# Count total concepts
ls /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | wc -l

# List all concept IDs
ls /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//' | sort

# List all concept names
grep -h '"name"' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | sed 's/.*"name": "//;s/".*//' | sort

# List all tags (unique)
grep -h '"tags"' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | sed 's/.*\[/[/' | tr ',' '\n' | tr -d '[]"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | grep -v '^$' | sort -u

# List all categories
grep -h '"category"' /home/dsebastien/wks/concept-cards/src/data/concepts/*.json | sed 's/.*"category": "//;s/".*//' | sort -u
```

---

## CONCEPT ID GENERATION

Generate proper ID from concept name:

```bash
# Convert "Parkinson's Law" to "parkinsons-law"
echo "Parkinson's Law" | tr '[:upper:]' '[:lower:]' | sed "s/'//g" | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g'
```

---

## Example: Complete Workflow

```bash
# 1. Quick check
grep -ri "parkinson" /home/dsebastien/wks/concept-cards/src/data/concepts/ 2>/dev/null
# No matches - proceed

# 2. Verify concept doesn't exist
npx tsx scripts/verify-concept.ts \
  --name "Parkinson's Law" \
  --summary "Work expands to fill time available"

# Output shows: Confidence: 15% - No strong matches found. Safe to add.

# 3. Find related public notes (use /fetch-public-notes skill for details)
find /home/dsebastien/notesSeb/30\ Areas -type f -name "*Parkinson*.md" 2>/dev/null | grep -v ".smart-env"
# If found, convert path to public URL and add to relatedNotes array

# 4. Find related articles
for f in $(grep -ril "parkinson" "/home/dsebastien/notesSeb/30 Areas/33 Permanent notes/33.04 Creations/Articles/"*.md 2>/dev/null | grep -v "(Draft)"); do
  echo "=== $(basename "$f") ==="
  grep -m1 "^title:" "$f" | sed 's/title: //'
  grep -m1 "^url:" "$f" | sed 's/url: //'
done
# If articles found, include them in concept JSON

# 5. Create concept JSON file
# (Create /home/dsebastien/wks/concept-cards/src/data/concepts/parkinsons-law.json)
# Include found notes in "relatedNotes" array
# Include found articles in "articles" array

# 6. Sync database
npx tsx scripts/sync-concepts-db.ts

# Output: ✓ Added parkinsons-law to database
```
