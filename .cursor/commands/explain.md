# Explain

Explain the code snippet or request passed after the `/explain` command.

## What to explain (determine in this order)

1. The text after `/explain` (a question, term, or request from the prompt).
2. The selected code fragment or a mentioned file/symbol (`@file`, `@symbol`).
3. If nothing is specified, explain the currently open file. If there is none either, ask a clarifying question.

## How to explain

Respond concisely and to the point. Before explaining, read the related code (imports, call sites, types) if needed; do not guess.

Response structure:

1. **Summary** — 1–2 sentences: what the code does or what the request means.
2. **How it works** — step by step, covering the key lines. For code, reference fragments in the `startLine:endLine:filepath` format.
3. **Why it's done this way** — the reasoning behind the solution and the patterns used (Signals, `resource()`, Control Flow, Hexagonal/DDD, spartan/ui, Tailwind, etc.).
4. **Relations** — where it is used, what it depends on, which architecture layers it affects.
5. **Risks and notes** — pitfalls, bugs, deviations from project rules (only if any).

If a prompt request is ambiguous, first list the possible interpretations and explain the most likely one.

## Constraints

- Do not modify any code: explanation only.
- Do not retell the code line by line unless it is needed for understanding.
- For readers new to the topic, add a short example or analogy if it helps.

## Language

Always write the final answer in Russian, regardless of the language of the code, the request, or these instructions. This overrides any other language instruction above.
