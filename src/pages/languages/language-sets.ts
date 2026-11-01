// What a language page is: what it says, and the set it is written in. The
// sets are `neottx write-text`'s, from the engine's write_text/sets.rs.
//
// A page's text is the opening of the Universal Declaration of Human Rights in
// that language: its title as the headline, then Articles 1 and 3. Where a set
// lacks a character the text is changed to the nearest it has, as TODO-1162
// lists, and a language with no text of the Declaration to hand shows its name
// and letters alone. CREDITS.md says where the texts came from. A line break
// in `text` or `letters` is a Thai or Lao break between words, which have no
// spaces to break at.

/** Where a page's text came from. */
type TextSource =
  /** The UN's translation, from an XML transcription of it. */
  | "un"
  /** The UN's translation, read from the UN's own PDF. */
  | "un-pdf"
  /** The UN's translation, read by eye from the UN's scan: unverified. */
  | "un-scan"
  /** Article 1 as Wikipedia quotes it, not checked against the UN: unverified. */
  | "wikipedia"
  /** The UN's Cyrillic text put into the Latin alphabet, letter by letter: unverified. */
  | "transliterated"
  /** No text of the Declaration was found: the page has no headline or text. */
  | "none";

/** The sets by name, each with its seven-bit designation, group << 3 | option (the engine's EN 300 706 Table 32 and its own values). */
export const SET_DESIGNATIONS = {
  english: 0b0000_000,
  german: 0b0000_001,
  "swedish-finnish-hungarian": 0b0000_010,
  italian: 0b0000_011,
  french: 0b0000_100,
  "portuguese-spanish": 0b0000_101,
  "czech-slovak": 0b0000_110,
  polish: 0b0001_000,
  turkish: 0b0010_110,
  "serbian-croatian-slovenian": 0b0011_101,
  romanian: 0b0011_111,
  estonian: 0b0100_010,
  "lettish-lithuanian": 0b0100_011,
  "cyrillic-serbian-croatian": 0b0100_000,
  "russian-bulgarian": 0b0100_100,
  "cyrillic-ukrainian": 0b0100_101,
  greek: 0b0110_111,
  hebrew: 0b1010_101,
  "hausa-fula": 0b0101_000,
  "west-african": 0b0101_001,
  ewe: 0b0101_010,
  "kabyle-tamazight": 0b0101_011,
  azerbaijani: 0b0101_100,
  "kanuri-mossi": 0b0101_101,
  "yoruba-igbo": 0b0101_110,
  vietnamese: 0b0101_111,
  ukrainian: 0b0111_000,
  belarusian: 0b0111_001,
  macedonian: 0b0111_010,
  serbian: 0b0111_011,
  "kyrgyz-mongolian": 0b0111_101,
  tatar: 0b0111_110,
  tajik: 0b0111_111,
  georgian: 0b1011_000,
  armenian: 0b1011_001,
  tifinagh: 0b1011_010,
  persian: 0b1001_000,
  urdu: 0b1001_001,
  pashto: 0b1001_010,
  sindhi: 0b1001_011,
  sorani: 0b1001_100,
  uyghur: 0b1001_101,
  balochi: 0b1001_110,
  arabic: 0b1001_111,
  thai: 0b1100_010,
  lao: 0b1100_100,
} as const;

/** A set's name. */
export type SetName = keyof typeof SET_DESIGNATIONS;

/** One language's page. */
export interface Language {
  /** Its name in English, for the index and the channel's contents. */
  readonly name: string;
  readonly set: SetName;
  /** Its name in itself. */
  readonly own: string;
  readonly headline: string;
  readonly text: string;
  /** The alphabet's special letters. */
  readonly letters: string;
  readonly source: TextSource;
  /** The address of the revision its text came from, on a page of Wikipedia's text: Latin letters, short enough for a row. */
  readonly article?: string;
  /** The word for an index, on a page whose sets have no Latin letters for one. */
  readonly index?: string;
}
