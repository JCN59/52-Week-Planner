# Personal AI Vault

A tool-agnostic second brain: plain markdown files and folders that every AI tool
(Claude Code, Codex, ChatGPT, Gemini) and Obsidian can share as one source of truth.

**Agents: read `AGENTS.md` first.** (`CLAUDE.md` just points there — one rulebook
for every tool.)

## Structure

```
vault/
├── CLAUDE.md        # pointer → AGENTS.md (so Claude tools find the rules)
├── AGENTS.md        # the rulebook every AI agent reads first
├── README.md        # this file — the map
├── INTERVIEW.md     # onboarding interview — answer it to flesh out the vault
├── TASKS.md         # the always-on to-do list, visible to every tool
├── DECISIONS.md     # dated log of decisions, newest first
├── 00-inbox/        # quick capture; file it later
├── 10-personal/     # profile, health, home, travel, life admin
├── 20-business/     # one subfolder per business / brand / client
│   └── stargazer/   # StarGazer apparel: brand, Meta ads, Shopify
├── 30-projects/     # one note per active project (incl. software repos)
├── 40-workflows/    # repeatable how-to's
├── 50-prompts/      # reusable prompts that worked
├── 60-templates/    # skeletons for new notes
└── 70-private/      # git-ignored; never committed, never quoted externally
```

## How to use it

- **From Claude Code / Codex:** open this folder (or the repo containing it) and
  work normally — agents pick up `AGENTS.md`/`CLAUDE.md` automatically.
- **From Obsidian:** *Open folder as vault* → select this `vault/` folder. Obsidian
  is the human viewing layer (graph, links, search); the AI tools only need the files.
- **Daily habit:** dump anything worth keeping into `00-inbox/`, keep `TASKS.md`
  honest, and log choices in `DECISIONS.md`. The vault gets more powerful the more
  context it holds.

## First step: the interview

Open `INTERVIEW.md` in Claude Code, say "interview me from INTERVIEW.md, one
question at a time," and talk (a microphone works great). The agent will use your
answers to fill in `10-personal/profile.md`, expand the business folders, and
restructure anything that doesn't fit your real life.

## Migration plan → its own repo

This vault currently lives inside the `52-Week-Planner` repo for convenience.
When ready, give it its own home:

1. Create a **private** GitHub repo, e.g. `jcn59/ai-vault`.
2. Copy the `vault/` folder's contents to the new repo root (the `.gitignore`
   entry for `70-private/` must come along — see `vault/.gitignore`).
3. Commit, push, then clone that repo on every machine where you use AI tools.
4. Point Obsidian at the clone; open the same folder in Claude Code / Codex.
5. Remove `vault/` from this repo once the new one is confirmed working.

Keep the repo **private** — it is your life in plain text. Sync between machines
with `git pull` / `git push` (or Obsidian Git plugin for automatic syncing).
