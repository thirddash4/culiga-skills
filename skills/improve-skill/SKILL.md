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

### 1. Identify the just-used skill

Find the SKILL.md you used. Project skills: `.claude/skills/<name>/SKILL.md` (symlinks to `.agents/skills/<name>/`). Personal MP-pack skills under `~/.claude/skills/` are read-only here — propose upstream PRs separately, do not edit.

If the skill lives in `~/.claude/` or another non-project location, **stop and report** — improve-skill only writes inside this repo.

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

## Pairs with

- `write-a-skill` — for cases where the right skill doesn't exist yet
- `setup-matt-pocock-skills` — for keeping the MP pack wired to this repo's conventions
