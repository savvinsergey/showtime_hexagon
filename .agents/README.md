# Shared project instructions

AGENTS.md is the entry point. Rules and roles are loaded explicitly by host adapters; skills live in `.agents/skills`. Cursor OpenSpec skill directories are symlinks to the shared originals. Edit shared files rather than adapters.

OpenSpec updates may regenerate Cursor commands or replace symlinks: review changes and preserve the shared layout and ship pipeline. MCP and sandbox settings remain host-specific. `.cursorignore` remains Cursor-specific.
