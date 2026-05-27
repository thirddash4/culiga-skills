---
name: improve-skill
description: After using any skill, capture friction and update its SKILL.md so the skill gets sharper every invocation. Use when a skill invocation finished and something was unclear, missing, drifted, or worked better than the SKILL.md described. Triggers on "improve the skill", "update the skill", "the skill was wrong about X", "/improve-skill", or as the closing step of every skill use under the always-use-and-improve workflow.
---

# improve-skill

Skills compound only if they get better with use. This skill is the closing step of every skill invocation: capture what you just learned, update the SKILL.md atomically, commit.

## When to invoke

- **Every time** another skill finishes (per repo CLAUDE.md `always use & improve` rule).
- When a skill said do X, but X didn't work — and you found Y instead.
- When the trigger phrase didn't auto-activate the skill (description gap).
- When the SKILL.md is silent on a case you hit.
- When the skill is drifting toward 2+ unrelated triggers (→ split it).

## Process

### 1. Identify the just-used skill and its source of truth

Find the SKILL.md you used and where it actually syncs from:

- **Project skill** — `.claude/skills/<name>/SKILL.md` (often a symlink to `.agents/skills/<name>/`). Edit in place, commit to the project repo.
- **Globally installed via `npx skills add`** — lives at `~/.agents/skills/<name>/` with a symlink at `~/.claude/skills/<name>/`. **Local edits are overwritten on the next `npx skills update`.** The source of truth is the GitHub repo it came from (check `~/.claude/skills/skills-lock.json` or `~/.agents/skills/skills-lock.json` for the `source: owner/repo` field). Clone that repo, edit `skills/<name>/SKILL.md` there, commit, push — or re-publish via the `skill-publisher` skill. Do **not** edit the local copy alone.
- **Personal MP-pack skills under `~/.claude/skills/<name>/`** (not installed by `npx skills`, no lockfile entry) — read-only from this project; propose upstream PRs to mattpocock/skills.

### 2. Capture the delta

Answer in 1-3 bullets:

- **What worked** that wasn't in the SKILL.md → add as explicit step
- **What didn't work / was unclear** → fix wording or remove
- **What was missing** → add as new trigger / step / example
- **What drifted** → if SKILL.md now describes 2+ verbs or 2+ outcomes, split (see §4)

If nothing changed, exit — don't write filler.

### 3. Write the diff

- **Surgical**: edit only the lines that need to change. Preserve voice and structure.
- **Front-matter `description:`** is the highest-leverage field — it determines auto-invocation. Tighten triggers there before anything else.
- **Examples**: replace generic examples with the real one you just hit.
- **Never add hypothetical content** — only what you observed this session.

### 4. One-task-one-skill rule

A skill = one verb, one outcome. If the updated SKILL.md now reads like 2+ unrelated jobs:

- Split into separate skills (each with its own dir + SKILL.md).
- Update cross-references and the project skill index.
- The original skill keeps the most-used trigger; the split absorbs the others.

Signs of drift:
- `description:` uses "or" between unrelated verbs ("audit or fix or...")
- Two distinct outputs (a report AND a code change)
- Two distinct triggers in different domains

### 5. Commit atomically

One commit per skill update:

```
docs(skill): improve <skill-name> — <one-line reason>
```

Body: 1-3 bullets matching §2 deltas. No co-author trailer unless an agent made the edit.

## Anti-patterns

- Adding sections "for completeness" with no observed need
- Padding triggers with synonyms that won't change matching behaviour
- Renaming the skill (breaks invocation everywhere)
- Editing other people's personal skills (`~/.claude/skills/...`)
- Skipping the commit (improvements that never land are lost on next session)
- Editing the local copy of a `npx skills`-installed skill without pushing back to its source repo (next `update` wipes the edit)

## Pairs with

- `write-a-skill` — for cases where the right skill doesn't exist yet
- `setup-matt-pocock-skills` — for keeping the MP pack wired to this repo's conventions
