import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/docx/dist/index.cjs");

const output = "D:/Jaralingua/Unit_4_Everyday_Life_Kahoot_Questions.docx";
const navy = "123B8F";
const dark = "071F4F";
const red = "C1121F";
const light = "EEF4FF";
const gray = "475569";

const questions = [
  ["Why do we use the simple present for daily routines?", ["Because they are happening only now.", "Because they are normal or repeated actions.", "Because they happened yesterday.", "Because they are future plans."], "B", "The simple present describes normal, repeated, or typical actions."],
  ["Which sentence is correct?", ["She go to work in the morning.", "She going to work in the morning.", "She do go to work in the morning.", "She goes to work in the morning."], "D", "With he, she, or it, the verb normally takes -s or -es."],
  ["Complete the sentence: They _____ after school.", ["study", "studies", "studying", "does study"], "A", "Use the base verb with they."],
  ["Which negative sentence is correct?", ["She doesn't wakes up early.", "She not wake up early.", "She doesn't wake up early.", "She don't wakes up early."], "C", "After doesn't, use the base verb: wake."],
  ["Complete the question: _____ your brother study at night?", ["Do", "Does", "Is", "Are"], "B", "Use does with a third-person singular subject."],
  ["Which question asks for an exact clock time?", ["What time do you wake up?", "How often do you wake up?", "Where do you wake up?", "Do you wake up?"], "A", "What time asks for a specific time."],
  ["Choose the correct preposition: I wake up _____ 6:00.", ["on", "in", "from", "at"], "D", "Use at with exact clock times."],
  ["Choose the correct expression: She studies _____ the evening.", ["at", "on", "in", "to"], "C", "Use in with parts of the day."],
  ["Choose the correct expression: We play basketball _____ Fridays.", ["on", "at", "in", "by"], "A", "Use on with days of the week."],
  ["What does wake up mean?", ["Leave the house.", "Stop sleeping.", "Put on clothes.", "Go to sleep."], "B", "Wake up means to stop sleeping."],
  ["Which activity means to put on clothes?", ["take a shower", "brush my teeth", "have breakfast", "get dressed"], "D", "Get dressed means to put on clothes."],
  ["Which adverb represents 100% frequency?", ["usually", "often", "always", "sometimes"], "C", "Always means every time."],
  ["Which adverb best matches 80%?", ["never", "usually", "rarely", "sometimes"], "B", "Usually describes a normal habit and is shown as about 80%."],
  ["Which adverb best matches 5%?", ["hardly ever", "often", "almost always", "frequently"], "A", "Hardly ever means almost never."],
  ["Where does the frequency adverb normally go? I _____ study at night.", ["after the object", "after the time expression", "before the subject", "before the main verb"], "D", "Frequency adverbs normally go before a main action verb."],
  ["Which sentence places the adverb correctly with be?", ["She always is busy.", "Always she is busy.", "She is always busy.", "She is busy always every day."], "C", "With am, is, or are, the adverb comes after be."],
  ["Which verb is used with soccer?", ["play", "do", "go", "make"], "A", "Use play with team sports, ball sports, and games."],
  ["Complete the sentence: I _____ swimming twice a week.", ["play", "do", "go", "make"], "C", "Use go + -ing for movement activities such as swimming."],
  ["Which expression means general exercise?", ["play out", "work out", "go exercise", "do out"], "B", "Work out means to exercise."],
  ["Which sentence is correct?", ["She play basketball on Saturdays.", "She does basketball on Saturdays.", "She going basketball on Saturdays.", "She plays basketball on Saturdays."], "D", "Use plays with she and a sport."],
  ["Which sentence gives activity, frequency, and time?", ["I work out three times a week.", "I work out healthy.", "Three times exercise.", "I am work out."], "A", "A complete routine can include activity plus frequency and time."],
  ["What does cut down on soda mean?", ["Buy more soda.", "Drink soda quickly.", "Stop drinking water.", "Reduce the amount of soda."], "D", "Cut down on means reduce something."],
  ["What is an early bird?", ["A person who plays sports outside.", "A person who wakes up early.", "A person who sleeps during class.", "A person who studies only at night."], "C", "An early bird is someone who gets up early."],
  ["What is a night owl?", ["A person who eats healthy food.", "A person who wakes up before sunrise.", "A person who never studies.", "A person who stays active or studies late at night."], "B", "A night owl is active late at night."],
  ["Which is a healthy life activity?", ["drinking water", "skipping breakfast", "drinking too much soda", "sleeping very little"], "A", "Drinking water supports hydration and healthy routines."],
];

function text(text, options = {}) {
  return new TextRun({ text, font: "Calibri", color: options.color || dark, size: options.size || 22, bold: options.bold, italics: options.italics });
}

function optionParagraph(letter, value) {
  return new Paragraph({
    spacing: { after: 45, line: 280 },
    indent: { left: 360, hanging: 240 },
    children: [text(`${letter}. `, { bold: true, color: navy }), text(value)],
  });
}

const body = [];
body.push(new Paragraph({ spacing: { before: 100, after: 80 }, children: [text("JARALINGUA | BASIC ENGLISH COURSE 1", { bold: true, color: red, size: 20 })] }));
body.push(new Paragraph({ spacing: { after: 80 }, children: [text("Kahoot Question Bank", { bold: true, color: navy, size: 44 })] }));
body.push(new Paragraph({ spacing: { after: 180 }, children: [text("Unit 4: Everyday Life", { bold: true, color: dark, size: 30 })] }));

const intro = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [3120, 3120, 3120],
  rows: [new TableRow({ children: [
    new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: light, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text("25 questions", { bold: true, color: navy })] })] }),
    new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: light, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text("A1 level", { bold: true, color: navy })] })] }),
    new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: light, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text("4 options", { bold: true, color: navy })] })] }),
  ] })],
});
body.push(intro);
body.push(new Paragraph({ spacing: { before: 180, after: 80 }, children: [text("Teacher notes", { bold: true, color: navy, size: 28 })] }));
body.push(new Paragraph({ spacing: { after: 80, line: 300 }, children: [text("Each item has one correct answer. Suggested Kahoot time: 20 seconds for vocabulary and grammar items; 30 seconds for questions requiring sentence comparison. Correct answers are balanced across A, B, C, and D.", { color: gray })] }));
body.push(new Paragraph({ children: [new PageBreak()] }));

questions.forEach((q, index) => {
  const [question, options] = q;
  body.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    spacing: { before: index === 0 ? 0 : 150, after: 70 },
    children: [text(`${index + 1}. ${question}`, { bold: true, color: dark, size: 25 })],
  }));
  options.forEach((value, optionIndex) => body.push(optionParagraph(String.fromCharCode(65 + optionIndex), value)));
});

body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(new Paragraph({ spacing: { after: 120 }, children: [text("Teacher Answer Key", { bold: true, color: navy, size: 36 })] }));
body.push(new Paragraph({ spacing: { after: 140 }, children: [text("Keep this section hidden while students play.", { italics: true, color: gray })] }));

const keyRows = [new TableRow({ tableHeader: true, children: [
  new TableCell({ shading: { fill: navy, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text("#", { bold: true, color: "FFFFFF" })] })] }),
  new TableCell({ shading: { fill: navy, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text("Answer", { bold: true, color: "FFFFFF" })] })] }),
  new TableCell({ shading: { fill: navy, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [text("Explanation", { bold: true, color: "FFFFFF" })] })] }),
] })];

questions.forEach((q, index) => {
  keyRows.push(new TableRow({ children: [
    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(String(index + 1), { bold: true })] })] }),
    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text(q[2], { bold: true, color: red })] })] }),
    new TableCell({ children: [new Paragraph({ spacing: { line: 280 }, children: [text(q[3], { color: gray, size: 20 })] })] }),
  ] }));
});

body.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [700, 1100, 7560], rows: keyRows }));

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: dark }, paragraph: { spacing: { after: 120, line: 300 } } } },
    paragraphStyles: [
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 26, bold: true, color: dark }, paragraph: { spacing: { before: 180, after: 80 }, keepNext: true } },
    ],
  },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }, size: { width: 12240, height: 15840 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [text("Unit 4 | Everyday Life", { color: gray, size: 18 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [text("JaraLingua  |  Page ", { color: gray, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", color: gray, size: 18 })] })] }) },
    children: body,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(output, buffer);
console.log(output);
