// The quiz's questions, on teletext.

import type { Question } from "neottx-server-ts-ui-components";

export const QUESTIONS: readonly Question[] = [
  { question: "How many columns does a teletext page have?", answers: ["24", "40", "64", "80"], right: 1 },
  { question: "Which page carried subtitles on many services?", answers: ["100", "302", "888", "999"], right: 2 },
  { question: "What is a sixel?", answers: ["A sixth of a mosaic cell", "A font", "A page number", "A colour"], right: 0 },
  { question: "How many colours does Level 1 have?", answers: ["2", "4", "8", "16"], right: 2 },
  { question: "What do the coloured keys follow?", answers: ["Subtitles", "Fastext links", "The clock", "The header"], right: 1 },
  { question: "What was the BBC's teletext called?", answers: ["Oracle", "Prestel", "Ceefax", "Minitel"], right: 2 },
];
