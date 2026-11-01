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
| `wikipedia` | 3, Kabyle, Nuer, Sorani | Article 1 as English Wikipedia's articles on Kabyle and Nuer quote it, and Articles 1 and 3 as the Sorani Wikipedia gives them: unverified against the UN |
| `transliterated` | 1, Kazakh | The UN's Cyrillic text put letter by letter into Kazakhstan's Latin alphabet for these pages: unverified, and not a published text |
| `none` | 1, Mandinka | No text of the Declaration in Mandinka was found, so the page shows the language's name and letters alone. The name is spelled as Omniglot spells it |

The texts differ from their sources where a character set lacks a character and
where a source has a slip. Every such change is listed in rdm's TODO-1162. The
lists of each alphabet's letters were written for these pages, and are not from
these sources.

## The licence of these texts

`LICENSE` covers this repository's code. It does not cover these texts, and no
licence for them has been established:

- The UDHR in XML repository states no licence (read on 2 November 2026).
- The terms of use of un.org, un.org/en/about-us/terms-of-use, allow material
  on that site to be copied for personal, non-commercial use (read on
  2 November 2026). No permission specific to these translations was found: the
  High Commissioner's own pages on them refused the fetch.
- Wikipedia offers its text under CC BY-SA 4.0.

The rights in the translations stay with their holders.
