# Credits

## The language pages

The language pages show the Universal Declaration of Human Rights, adopted by
the General Assembly of the United Nations in resolution 217 A (III) on
10 December 1948: its title, then Articles 1 and 3 where the source has both.
The translations are those the Office of the United Nations High Commissioner
for Human Rights publishes, except where the list below says otherwise.

Each language's `source` in `src/pages/languages/` says which of these its text
came from:

| `source` | Pages | Where the text came from |
|---|---|---|
| `un` | 65 | The UN's translations as transcribed by the UDHR in XML project, github.com/eric-muller/udhr, commit 588b3f4, because the UN's own site refuses automated fetches |
| `un-pdf` | 1, Sindhi | The UN's PDF, `snd.pdf`, read through web.archive.org |
| `un-scan` | 1, Balochi | The UN's scanned PDF, `bgp.pdf`, read through web.archive.org by eye: unverified |
| `wikipedia` | 3, Kabyle, Nuer, Sorani | Wikipedia, as "The texts from Wikipedia" below sets out: unverified against the UN |
| `transliterated` | 1, Kazakh | The UN's Cyrillic text put letter by letter into Kazakhstan's Latin alphabet for these pages: unverified, and not a published text |
| `none` | 1, Mandinka | No text of the Declaration in Mandinka was found, so the page shows the language's name and letters alone. The name is spelled as Omniglot spells it |

The texts differ from their sources where a character set lacks a character and
where a source has a slip. Every such change is listed in rdm's TODO-1162. The
lists of each alphabet's letters were written for these pages, and are not from
these sources.

## The texts from Wikipedia

Three pages show text adapted from Wikipedia, written by Wikipedia's
contributors. As adapted here, in the language tables and in the pages made
from them, those three texts stay under the Creative Commons
Attribution-ShareAlike 4.0 International licence,
https://creativecommons.org/licenses/by-sa/4.0/, and may be reused only under
it. Each page shows its credit, the revision's address, that the text was
changed, and the licence, in rows of its own in Latin letters.

All three were read on 1 November 2026. Each revision below is established and
not assumed: the SHA-1 that Wikipedia gives for that revision equals the SHA-1
of the wikitext as it was read.

**Kabyle, page 850.** The article "Kabyle language",
https://en.wikipedia.org/wiki/Kabyle_language, revision 1382739977 of
30 October 2026, https://en.wikipedia.org/w/index.php?oldid=1382739977 (SHA-1
46742fffb5c6ffe5cb12fec5b175d11fcaf72f80), read at 11:49 UTC. Taken from it:
Article 1 of the Declaration, as the article quotes it. Changed: the Greek
letter `ε` is written `ɛ`, which the page's set has, and the space before a
semicolon is removed.

**Nuer, page 864.** The article "Nuer language",
https://en.wikipedia.org/wiki/Nuer_language, revision 1362123989 of
2 July 2026, https://en.wikipedia.org/w/index.php?oldid=1362123989 (SHA-1
9af53469dcccd081e0e955d4460443b58d902a03), read at 11:49 UTC. Taken from it:
Article 1 of the Declaration, which the article cites from Omniglot,
http://www.omniglot.com/writing/nuer.htm. Changed: `a̱` is written `a`, because
the page's set cannot show it.

**Sorani, page 877.** The article "بانگنامەی گەردوونیی مافەکانی مرۆڤ",
https://ckb.wikipedia.org/wiki/بانگنامەی_گەردوونیی_مافەکانی_مرۆڤ, page 76024,
revision 1459364 of 17 July 2025,
https://ckb.wikipedia.org/w/index.php?oldid=1459364 (SHA-1
5b84dce077b8712eafbd74df6f86599058a2f491), read at 11:50 UTC. Taken from it:
its title as the headline, and Articles 1 and 3. Changed: in Article 1, heh
followed by a zero-width non-joiner is written `ە`, the other zero-width
non-joiners are removed, and stray spaces are removed.

The channel has no credits page of its own for viewers, so a page's own rows
are where its credit stands.

## The licence of these texts

`LICENSE` covers this repository's code. It does not cover these texts, and
apart from the three texts from Wikipedia no licence for them has been
established:

- The UDHR in XML repository states no licence (read on 2 November 2026).
- The terms of use of un.org, un.org/en/about-us/terms-of-use, allow material
  on that site to be copied for personal, non-commercial use (read on
  2 November 2026). No permission specific to these translations was found: the
  High Commissioner's own pages on them refused the fetch.
- The three texts from Wikipedia are under CC BY-SA 4.0, as above. That licence
  reaches what Wikipedia's contributors hold: whether it reaches a translation
  of the Declaration that they quote has not been established.

The rights in the translations stay with their holders.
