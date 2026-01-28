---
name: discover-missing-concepts
description: Automatically discover and add missing concepts on autopilot. Finds broken relatedConcepts references, explores MoCs, and mines the local notes repository. Re-enters continuously until no new concepts found.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task, WebFetch, WebSearch
---

# Discover Missing Concepts (Autopilot Mode)

**Purpose**: Continuously discover and add missing concepts until the knowledge base is complete.

**Note**: Uses `$OBSIDIAN_VAULT_LOCATION` environment variable to access the notes repository.

## Autopilot Loop Architecture

This skill runs in a continuous discovery loop:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISCOVERY SOURCES                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Broken relatedConcepts → missing references in JSON files    │
│ 2. MoC Mining → concepts from Maps of Content                    │
│ 3. Notes Repository → permanent/literature notes                 │
│ 4. Tag Exploration → concepts related to existing tags           │
│ 5. Category Gaps → concepts that fill category gaps              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PROCESSING PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Collect candidate concepts from all sources                   │
│ 2. Deduplicate and prioritize                                    │
│ 3. Verify each candidate (not duplicate)                         │
│ 4. Create concept JSON files                                     │
│ 5. Run fix-concepts and sync                                     │
│ 6. RE-ENTER → Loop back to discovery                             │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

Run the full autopilot loop:

```
1. Find missing concepts from all sources
2. Process batch of 5-10 concepts
3. Fix & sync
4. RE-ENTER (repeat until exhausted)
```

## Source 1: Broken relatedConcepts References

Find concepts referenced but not existing:

```bash
# Extract all relatedConcepts references
grep -h '"relatedConcepts"' src/data/concepts/*.json | \
  tr ',' '\n' | grep -oE '"[a-z0-9-]+"' | tr -d '"' | sort -u > /tmp/referenced.txt

# Get existing concept IDs
ls src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//' | sort > /tmp/existing.txt

# Find missing (referenced but not existing)
comm -23 /tmp/referenced.txt /tmp/existing.txt
```

## Source 2: MoC Mining

Fetch concepts from Maps of Content:

```bash
# List available MoCs locally
find "$OBSIDIAN_VAULT_LOCATION/30 Areas/34 Maps/34.01 MoCs" -type f -name "*.md" 2>/dev/null | head -20
```

Key MoCs to mine:
- `Productivity (MoC).md`
- `Personal Knowledge Management (MoC).md`
- `Mental Models (MoC).md`
- `Learning (MoC).md`
- `Well-being (MoC).md`
- `Creativity (MoC).md`
- `Writing (MoC).md`

### Fetch MoC Content via API

```
WebFetch:
  url: https://publish-01.obsidian.md/access/91ab140857992a6480c9352ca75acb70/30%20Areas/34%20Maps/34.01%20MoCs/[MoC-Name].md
  prompt: List all linked note names that could be concepts. Return as a simple list.
```

## Source 3: Notes Repository Mining

Scan permanent notes for concept candidates:

```bash
# Find permanent notes with concept-like titles
find "$OBSIDIAN_VAULT_LOCATION/30 Areas/33 Permanent notes/33.02 Content" -type f -name "*.md" 2>/dev/null | \
  xargs -n1 basename | sed 's/.md$//' | sort > /tmp/all_notes.txt

# Compare with existing concepts
ls src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//' | sort > /tmp/existing.txt

# Find notes that could become concepts (rough match)
wc -l /tmp/all_notes.txt /tmp/existing.txt
```

### Literature Notes

```bash
# Literature notes often contain concepts
find "$OBSIDIAN_VAULT_LOCATION/30 Areas/32 Literature notes/32.02 Content" -type f -name "*.md" 2>/dev/null | head -20
```

## Source 4: Tag Expansion

Find concepts that would fill tag gaps:

```bash
# Current tags with counts
grep -h '"tags"' src/data/concepts/*.json | tr ',' '\n' | tr -d '[]"' | \
  sed 's/^[[:space:]]*//' | grep -v "^$" | sort | uniq -c | sort -rn | head -30

# Tags with few concepts (opportunities for expansion)
grep -h '"tags"' src/data/concepts/*.json | tr ',' '\n' | tr -d '[]"' | \
  sed 's/^[[:space:]]*//' | grep -v "^$" | sort | uniq -c | sort -n | head -20
```

## Batch Processing Workflow

### Step 1: Collect Candidates

Run discovery commands above, compile list of 5-10 candidates per batch.

### Step 2: Verify Each Candidate

```bash
npx tsx scripts/verify-concept.ts --name "Candidate Name" --summary "Brief description"
```

- **≥90% confidence**: Skip (duplicate)
- **70-89%**: Review manually
- **<70%**: Proceed

### Step 3: Create Concept JSON (Parallel)

For each verified candidate, spawn sub-agent:

```
Task tool (subagent_type="general-purpose"):
"Create concept for [NAME]:
1. Search for source note: find \"$OBSIDIAN_VAULT_LOCATION/30 Areas\" -name '*KEYWORD*' -type f 2>/dev/null
2. Read source note if found
3. Generate comprehensive explanation (what, how, why, applications)
4. Find related notes and articles
5. Add Wikipedia reference
6. Create JSON at src/data/concepts/[id].json following schema
7. Category: match to existing categories
8. Tags: use existing tags, pluralized"
```

### Step 4: Fix & Sync

```bash
bun run fix-concepts
npx tsx scripts/sync-concepts-db.ts
bun run build 2>&1 | tail -10
```

### Step 5: RE-ENTER Loop

After each batch:
1. Check for new broken references (created by new concepts)
2. Check for new related concepts discovered
3. If new candidates found → process next batch
4. If no new candidates → complete

## Autopilot Commands

### Full Autopilot Run

```bash
# Count potential missing concepts
comm -23 <(grep -h '"relatedConcepts"' src/data/concepts/*.json | tr ',' '\n' | grep -oE '"[a-z0-9-]+"' | tr -d '"' | sort -u) <(ls src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//' | sort) | wc -l
```

### Progress Tracking

```bash
# Total concepts
ls src/data/concepts/*.json | wc -l

# Missing references count
comm -23 <(grep -h '"relatedConcepts"' src/data/concepts/*.json | tr ',' '\n' | grep -oE '"[a-z0-9-]+"' | tr -d '"' | sort -u) <(ls src/data/concepts/*.json | xargs -n1 basename | sed 's/.json$//' | sort) | wc -l

# Categories coverage
grep -h '"category"' src/data/concepts/*.json | sed 's/.*"category": "//;s/".*//' | sort | uniq -c | sort -rn
```

## Stopping Conditions

Stop autopilot when:
1. No broken relatedConcepts references remain
2. All MoC concepts are covered (>80%)
3. User-defined batch limit reached
4. Error threshold exceeded (3+ consecutive failures)

## Concept Quality Requirements

Each concept must have:
- **id**: lowercase, hyphenated
- **name**: proper capitalization
- **summary**: one clear sentence
- **explanation**: 2-3 paragraphs minimum
- **tags**: 2-5 existing tags
- **category**: from approved list
- **references**: at least Wikipedia link
- **datePublished/dateModified**: today's date

## Example Autopilot Session

```
[Iteration 1]
- Found 15 broken relatedConcepts references
- Processing batch 1: 5 concepts
- Created: concept-a, concept-b, concept-c, concept-d, concept-e
- Fix & sync complete
- RE-ENTERING...

[Iteration 2]
- Found 12 broken references (3 fixed, 2 new from new concepts)
- Mining MoC: Productivity
- Processing batch 2: 5 concepts
- Created: concept-f, concept-g, concept-h, concept-i, concept-j
- Fix & sync complete
- RE-ENTERING...

[Iteration 3]
- Found 8 broken references
- Processing batch 3: 5 concepts
...

[Iteration N]
- Found 0 broken references
- All MoCs mined
- COMPLETE: Added 47 new concepts
```

## Parallel Sub-Agent Template

For maximum efficiency, spawn multiple sub-agents:

```
Task (subagent_type="general-purpose", run_in_background=true):
"AUTOPILOT CONCEPT CREATION for [CONCEPT-NAME]:

1. VERIFY: npx tsx scripts/verify-concept.ts --name '[NAME]'
   - If ≥90% duplicate: SKIP and report

2. RESEARCH:
   - Search local notes: find \"$OBSIDIAN_VAULT_LOCATION/30 Areas\" -name '*KEYWORD*' -type f 2>/dev/null | head -5
   - Read source if found
   - Search Wikipedia for reference

3. CREATE JSON at src/data/concepts/[id].json:
   {
     'id': '[lowercase-hyphenated]',
     'name': '[Name]',
     'summary': '[one sentence]',
     'explanation': '[2-3 paragraphs]',
     'tags': ['tag1', 'tag2'],
     'category': '[Category]',
     'icon': 'FaLightbulb',
     'featured': false,
     'aliases': [],
     'relatedConcepts': [],
     'relatedNotes': [],
     'references': [{'title': '[Name] - Wikipedia', 'url': 'https://en.wikipedia.org/wiki/...', 'type': 'website'}],
     'articles': [],
     'books': [],
     'tutorials': [],
     'datePublished': '[TODAY]',
     'dateModified': '[TODAY]'
   }

4. REPORT: concept created OR skipped (with reason)"
```

## Common Discovery Patterns

### Missing Method Concepts
```bash
grep -l '"category": "Methods"' src/data/concepts/*.json | wc -l
# If <30, mine productivity/PKM MoCs
```

### Missing Bias Concepts
```bash
grep -l '"category": "Cognitive Biases"' src/data/concepts/*.json | wc -l
# If <50, mine mental models MoC
```

### Missing Business Concepts
```bash
grep -l '"category": "Business & Economics"' src/data/concepts/*.json | wc -l
# If <40, mine business/economics notes
```

## Error Recovery

If a concept creation fails:
1. Log the error
2. Skip to next candidate
3. Continue batch
4. Report failures at end

After 3 consecutive failures:
1. Pause autopilot
2. Report issues
3. Wait for user intervention

## Integration with Other Skills

- Use `/manage-concepts-db` workflow for each concept
- Use `/fetch-public-notes` for MoC content
- Use `/add-wikipedia-references` for reference enrichment
