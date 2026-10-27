# neoteletext-server-channel-demosite

The NeoTeletext server's demo site: a channel program in TypeScript, on
the server's channel protocol (neottx-server-ts-protocol) and the
component library (neottx-server-ts-ui-components), both released into
`vendor/`. These rules add to `~/.claude/CLAUDE.md`.

## Working on the code

- **Always leave the code cleaner and better organised than you found
  it.** Each change is a chance to split what does two things, name what
  is unnamed, and delete what is unused.
- **The development process always uses the best-regarded linters and
  code analysis tools**, pinned, with their findings fixed rather than
  silenced. A suppression is narrow, at its site, with its reason.
- **Security is important and is always a factor** in every change: what
  the program reads from the server and from its pictures folder is
  untrusted, checked before it is used, and bounded.
- **Always use the latest TypeScript.** Never fall back to an older
  TypeScript to suit a tool: a tool that cannot run on the latest
  TypeScript is replaced, not accommodated.
- **The kits are released packages.** The program takes a new release of
  either into `vendor/`; it never imports their source.
- **MIT licence.** The repository is under the MIT licence: see `LICENSE`.
- **Components are classes. Hooks and function components are never to
  be implemented in this architecture**, on the owner's instruction of
  28 October 2026: every component extends the component library's
  `Component`, keeps its state in `state` and changes it with
  `setState`. This overrides the global rule's "function components and
  hooks only" for these programs.
