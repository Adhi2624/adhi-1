# Claude Code Project Configuration

This directory contains Claude Code configuration for the Typeset project.

## Setup

Copy the recommended permissions into your project settings:

```bash
# From the project root:
cp .claude/settings.recommended.json .claude/settings.json
```

Or run Claude Code in the project and use `/config` to customize permissions interactively.

## Files

- `settings.recommended.json` — Pre-approved tool permissions for common dev commands
- `settings.json` — Active settings (create from recommended, or let Claude Code generate)
