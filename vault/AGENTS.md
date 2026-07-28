# AGENTS.md — Instructions for every AI agent working in this vault

You are working inside a personal AI vault: a tool-agnostic "second brain" made of
plain markdown files. Claude Code, Codex, ChatGPT projects, Obsidian, and any other
tool all read from this same folder. Treat it as the single source of truth about
the owner's life, business, and projects.

## Who this belongs to

The owner's profile lives in `10-personal/profile.md`. Read it before doing
personalized work. If it conflicts with something the owner says in chat, the chat
wins — then update the profile so the vault stays current.

## Prime directives

1. **Read before you write.** Before starting any task, read this file, then the
   README of the folder you are working in, then any note the task touches.
2. **Write things down.** Any durable fact, decision, preference, or task that
   surfaces in conversation gets captured in the vault before the session ends:
   - Decisions → `DECISIONS.md` (one dated line each, newest first)
   - Tasks → `TASKS.md`
   - New facts about the owner → the relevant note in `10-personal/` or `20-business/`
   - Anything unsorted → a new note in `00-inbox/`
3. **One source of truth.** Never duplicate a fact into two notes; link to the note
   that owns it (Obsidian-style `[[wikilinks]]` or relative markdown links).
4. **Plain markdown only.** No proprietary formats. Every file must be readable by
   a human in a text editor. Use the templates in `60-templates/` for new notes.
5. **Keep the map current.** If you add, move, or delete folders, update the
   structure diagram in `README.md` in the same session.

## Folder rules

- `00-inbox/` — dumping ground. Anything captured quickly lands here. Periodically
  file inbox notes into their proper home; delete the inbox copy after filing.
- `10-personal/` — health, home, travel, life admin. Never mix business content in.
- `20-business/` — one subfolder per business/brand/client. Keep clients isolated
  from each other: when working on one client, do not read other clients' folders
  unless the task explicitly spans them.
- `30-projects/` — one note (or folder) per active project, built from
  `60-templates/project.md`. Software projects link to their GitHub repo; the code
  stays in the repo, the *context* (goals, status, decisions) stays here.
- `40-workflows/` — repeatable how-to's. If the owner does something twice, it
  becomes a workflow note.
- `50-prompts/` — reusable prompts. When a prompt works well, save it here.
- `60-templates/` — skeletons for new notes. Copy, don't edit, unless asked to
  improve the template itself.
- `70-private/` — git-ignored. Never commit its contents, never quote it into
  anything that leaves the machine (PRs, issues, emails, published artifacts).

## Privacy boundaries

- This vault may contain personal and business information. Do not paste vault
  contents into public places (public repos, public artifacts, social posts,
  external services) unless the owner explicitly asks for that specific content.
- Anything in `70-private/` is off-limits for output of any kind.
- Financial figures, customer data, and credentials never get committed. Credentials
  never get written to the vault at all — point to the secret manager instead.

## Style

- Notes start with a one-line summary. Short sections, plain language.
- Date things. Use `YYYY-MM-DD`.
- Prefer editing an existing note over creating a near-duplicate.

## Maintenance

This file is living documentation. When something goes wrong and the fix is "the
agent should have known X," add a one-line rule here — specific, not vague. Keep
this file under ~150 lines; prune rules that stop being relevant.
