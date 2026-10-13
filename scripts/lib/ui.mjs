// Gemeinsame Terminal-Helfer für die Scripts in scripts/ (Farben, Auswahl, Eingabe).

import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";

// Farben nur im Terminal und wenn NO_COLOR nicht gesetzt ist.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
// Verschachtelte Farben: Nach jedem inneren Reset wird die äußere Farbe erneuert.
const paint = (code) => (text) =>
  useColor
    ? `\x1b[${code}m${String(text).replaceAll("\x1b[0m", `\x1b[0m\x1b[${code}m`)}\x1b[0m`
    : String(text);

export const bold = paint(1);
export const dim = paint(2);
export const red = paint(31);
export const green = paint(32);
export const yellow = paint(33);
export const cyan = paint(36);

export const step = (n, total, text) =>
  console.log(`\n${cyan(`[${n}/${total}]`)} ${text}`);

// Auswahl per Pfeiltasten. choices: [{ label, hint?, value }]
export async function select(question, choices) {
  const { stdin, stdout } = process;
  if (!stdin.isTTY) {
    throw new Error(
      "Braucht ein interaktives Terminal, z. B. `npm run <script>`.",
    );
  }

  emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();
  stdout.write(`\x1b[?25l${bold(cyan(question))} ${dim("(↑/↓, Enter)")}\n`);

  let index = 0;
  const render = (redraw) => {
    if (redraw) stdout.write(`\x1b[${choices.length}A`);
    choices.forEach((choice, i) => {
      const hint = choice.hint ? `  ${dim(choice.hint)}` : "";
      const row =
        i === index
          ? `${bold(cyan(`❯ ${choice.label}`))}${hint}`
          : `  ${choice.label}${hint}`;
      stdout.write(`\x1b[2K${row}\n`);
    });
  };
  render(false);

  return new Promise((resolve) => {
    const finish = () => {
      stdin.off("keypress", onKey);
      stdin.setRawMode(false);
      stdin.pause();
      // Auswahlliste durch eine Zeile mit dem Ergebnis ersetzen
      stdout.write(`\x1b[${choices.length + 1}A\x1b[J\x1b[?25h`);
    };

    const onKey = (_, key = {}) => {
      if (key.ctrl && key.name === "c") {
        finish();
        process.exit(130);
      }
      if (key.name === "up") {
        index = (index - 1 + choices.length) % choices.length;
      } else if (key.name === "down") {
        index = (index + 1) % choices.length;
      } else if (key.name === "return") {
        finish();
        stdout.write(
          `${green("✔")} ${dim(question)} ${bold(choices[index].label)}\n`,
        );
        resolve(choices[index].value);
        return;
      }
      render(true);
    };

    stdin.on("keypress", onKey);
  });
}

// Freitext-Eingabe, z. B. um eine riskante Aktion durch Tippen zu bestätigen.
export async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(`${bold(cyan(question))} `)).trim();
  } finally {
    rl.close();
  }
}

// Führt main() aus und zeigt Fehler einheitlich an.
export function runMain(main) {
  main().catch((error) => {
    process.stdout.write("\x1b[?25h");
    console.error(`\n${red(bold("✖"))} ${red(error.message)}`);
    process.exit(1);
  });
}
