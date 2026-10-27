# Building neoteletext-server-channel-demosite

There is no build step. Node runs the `.ts` files as they are, by
stripping their types (Node 22.18 and later), so what is type-checked is
what runs. Every command below is run from the repository's root.

## What is needed

- **Node 22.18 or later.** `scripts/check.sh` refuses an older one.
- **TypeScript 7.0.2**, the latest release, pinned in `package-lock.json`
  with the other tools and installed by `npm ci`.
- **The kits**, neottx-server-ts-protocol and neottx-server-ts-ui-components:
  their releases in `vendor/`, which `npm ci` installs. Each is built and
  released in its own repository under `~/devel`; a new release is copied
  into `vendor/` and `package.json` names it.
- **The pictures**, for the gallery: a folder of converted pictures, as
  neoteletext-server-channels' `scripts/pictures.py` makes them in its
  `tmp/pictures`. Without it every page still works, and the gallery
  says it has none.

## Install the tools

    npm ci --ignore-scripts --no-audit --no-fund

`scripts/check.sh` does this itself whenever `package-lock.json` has
changed since the last install.

## Check

    npx --no -- tsc -p tsconfig.json            # type check, every strict option
    npx --no -- prettier --check src test       # formatting, .prettierrc.json
    npx --no -- oxlint --type-aware --tsconfig tsconfig.json --deny-warnings src test
                                                # lint, type-aware, .oxlintrc.json
    npx --no -- knip --no-progress              # unused files, exports, dependencies
    node --test "test/**/*.test.ts"             # the tests

`npx --no -- prettier --write src test` formats. Every tool is pinned in
`package.json`, and the lint's type-aware rules run on TypeScript 7
itself (oxlint-tsgolint is built on typescript-go).

`scripts/check.sh stage` runs them all, after checking the Node version
and installing the tools. The git hooks (`core.hooksPath` is
`.githooks`) run `scripts/check.sh`: on commit the stage, refused while
anything is unstaged; on push the stage on a clean tree and again on the
Linux host. A hook is never bypassed.

## Run

The server starts a channel program from neoteletext-server-channels'
`channels.json` and talks to it over standard input and output
(teletext-server's `docs/applications.md`). By hand:

    node src/main.ts [--pictures FOLDER]

On start the program writes to standard error how many pages it serves
and how many pictures it loaded.
