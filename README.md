# neoteletext-server-channel-demosite

The NeoTeletext demo site: what a teletext service can be, as one channel
of the NeoTeletext server. News and live services, pages that answer
back, games, adventures, music and pictures, every page made of the
component library's components.

It is a channel program: the server starts it and they talk in lines of
JSON on its standard input and output (teletext-server's
`docs/applications.md`). It is built on two libraries of the server's,
released into `vendor/`:

- **neoteletext-server-ts-protocol**, the channel protocol;
- **neoteletext-server-ts-ui-components**, the component library its pages
  are made of.

## Running it

It needs Node 22.18 or later, which runs the `.ts` files as they are, and
ffmpeg with libopus on the `PATH`, which encodes its sounds as Opus.

    npm ci --ignore-scripts --no-audit --no-fund
    node src/main.ts [--pictures FOLDER]

FOLDER holds the gallery's converted pictures: `captions.tsv` (a line for
each: name, group, caption) and each picture's `NAME_l15.tti`,
`NAME_l25.tti` and `NAME_l35.tti`, as neoteletext-server-channels'
`scripts/pictures.py` makes them in its `tmp/pictures`. Without it the
gallery says it has none. `BUILD.md` has the checks; `DEPLOYMENT.md` is
for the deploy.

## What is in it

The index is on 100; each area has a magazine, its menu on N00.

- **Services** (menu 110): news (101, a story a page from 111), weather
  (102), markets that move as you watch (103), a TV guide (104), a
  calendar (105), world clocks and a countdown (106), a long read over
  several sub-pages (107), the server's own figures (108), about (109).
- **Interactive** (200): calculator (201), a form in steps (202), a
  guestbook every viewer sees (203), a live poll (204), a quiz (205),
  paint (206).
- **Games** (300): Snake (301), Breakout (302), Invaders (303), a cave
  flyer (304), a lucky dip of the news (305), the hall of fame (306).
- **Adventure** (400): The Station (401) and The Crown (402), text
  adventures with pictures in mosaic.
- **Audio** (500): piano (501), drum machine (502), synth (503), tracker
  (504), a radio that streams its tunes (505).
- **Gallery** (600): the pictures by group, each opened on 601 at its
  three levels of teletext.

The code:

- `src/main.ts`: the program, which reads its options and the pictures
  and serves the pages.
- `src/site/`: the page numbers, the areas, each area's look, and what
  the pages share (the poll, the guestbook, the hall of fame).
- `src/pages/`: the pages, a folder to each area (home, services,
  interactive, games, adventure, audio, gallery).
- `src/parts/`: what the pages share: the frame, the page menus, sounds.
- `src/pictures/`: the pictures folder, read and checked.
- `test/`: the tests, with one picture of the gallery's in
  `test/pictures/`.

## Checks

`scripts/check.sh stage` runs every check: the type check with every
strict option, Prettier, oxlint (type-aware, warnings fail), Knip and the
tests. The git hooks (`core.hooksPath` is `.githooks`) run it on every
commit, and on a push again on the Linux host.

## Licence

MIT: see `LICENSE`.
