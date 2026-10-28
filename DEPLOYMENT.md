# Deploying neoteletext-server-channel-demosite

The channel runs on the deploy host as a program the server starts from
neoteletext-server-channels' `channels.json`. teletext-server's
`scripts/deploy.sh` deploys it with the server.

## What the host needs

- **Node 22.18 or later**, on the service's `PATH`.
- **ffmpeg with libopus**, on the service's `PATH`: every sound and stream
  is encoded as Opus with it (the component library's 4.0.0).
  `foundintelquiet4060` has it (`/usr/bin/ffmpeg`, checked on 28 October
  2026).
- **The pictures**, in neoteletext-server-channels' `tmp/pictures` beside
  this repository on the host, which the deploy fills.

## How it is deployed

1. **Check the commit:** push it, or run `scripts/check.sh full` on a
   clean tree at it. That runs the stage here and on the Linux host.
2. **Run teletext-server's `scripts/deploy.sh`.** For each repository of
   its own that `channels.json` names, it:
   - copies this repository to the host's
     `~/neoteletext-server-channel-demosite`, leaving out `.git`, `tmp`
     and `node_modules`;
   - installs its libraries there from `vendor/`, without the
     development tools: `npm ci --omit=dev --ignore-scripts`;
   - copies the pictures, neoteletext-server-channels' `tmp/pictures`
     (made by its `scripts/pictures.py` when missing), to the same place
     on the host;
   - copies `channels.json` and restarts the service.

## Its entry in channels.json

neoteletext-server-channels' `channels.json` names it. A relative
`directory` is taken from that file's own folder, so the entry names
this repository beside it, and the pictures from that repository:

    {"folder":"demosite","name":"NeoTeletext demo site","command":["node","src/main.ts","--pictures","../neoteletext-server-channels/tmp/pictures"],"directory":"../neoteletext-server-channel-demosite"}

On start the program writes to the service's journal how many pages it
serves and how many pictures it loaded:

    ssh foundintelquiet4060 journalctl --user -u teletext-server --no-pager -n 20 -o cat

## A new release of a library

`BUILD.md`, "What is needed": the release goes into `vendor/`,
`package.json` names it, the gates run, and the commit is deployed as
above.
