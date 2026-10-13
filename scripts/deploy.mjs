// Stellt einen gepushten Branch (Stand von GitHub) unter einer festen Domain bereit.
// Aufruf: npm run deploy

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import {
  bold,
  cyan,
  dim,
  green,
  runMain,
  select,
  step,
  yellow,
} from "./lib/ui.mjs";

// Neue Deploy-Ziele hier ergänzen.
const DOMAINS = ["dev.householdplanner.de"];

// Fester Arbeitsordner (zweiter Checkout des Repos), der bei jedem Lauf
// wiederverwendet wird. Ihn nach jedem Lauf zu löschen scheitert unter Windows,
// weil Prozesse der Vercel-CLI den Ordner noch kurz festhalten.
const WORKDIR = join(tmpdir(), `${basename(process.cwd())}-deploy`);

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

// shell: true, weil npx unter Windows eine .cmd-Datei ist.
const vercel = (args, stdio) =>
  execFileSync("npx", ["vercel", ...args], {
    cwd: WORKDIR,
    encoding: "utf8",
    stdio,
    shell: true,
  });

function remoteBranches() {
  const rows = git(
    "for-each-ref",
    "--sort=-committerdate",
    "--format=%(refname:short)\t%(committerdate:short)\t%(subject)",
    "refs/remotes/origin",
  )
    .split("\n")
    .map((row) => row.split("\t"))
    .filter(([ref]) => ref.startsWith("origin/") && ref !== "origin/HEAD")
    .map(([ref, date, subject]) => {
      const short = subject.length > 45 ? `${subject.slice(0, 44)}…` : subject;
      return {
        label: ref.slice("origin/".length),
        hint: `${date}  ${short}`,
        value: ref.slice("origin/".length),
      };
    });

  // main zuerst, der Rest nach letzter Aktivität
  return rows.sort((a, b) => (b.value === "main") - (a.value === "main"));
}

// Setzt den Arbeitsordner auf den gepushten Stand des Branches. So landen weder
// der aktuell ausgecheckte Branch noch lokale Änderungen im Deployment.
function checkoutIntoWorkdir(ref) {
  git("worktree", "prune"); // falls der Ordner inzwischen gelöscht wurde

  try {
    git("-C", WORKDIR, "checkout", "--force", "--detach", ref);
    git("-C", WORKDIR, "clean", "-fd"); // .vercel ist ignoriert und bleibt
  } catch {
    // Ordner fehlt oder ist kaputt: neu anlegen
    rmSync(WORKDIR, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 500,
    });
    git("worktree", "prune");
    git("worktree", "add", "--detach", WORKDIR, ref);
  }

  cpSync(".vercel", join(WORKDIR, ".vercel"), {
    recursive: true,
    force: true,
  });
}

async function main() {
  if (!existsSync(".vercel")) {
    throw new Error(
      "Projekt nicht mit Vercel verknüpft. Zuerst `npx vercel link`.",
    );
  }

  console.log(dim("Hole Stand von GitHub ..."));
  git("fetch", "--prune", "origin");

  const branch = await select("Welcher Branch?", remoteBranches());
  const domain = await select(
    "Welche Domain?",
    DOMAINS.map((d) => ({ label: d, value: d })),
  );

  const sha = git("rev-parse", "--short", `origin/${branch}`);
  const confirmed = await select(
    `${bold(branch)} ${yellow(`(${sha})`)} → ${bold(domain)} deployen?`,
    [
      { label: "Ja", value: true },
      { label: "Nein", value: false },
    ],
  );
  if (!confirmed) {
    console.log(yellow("Abgebrochen."));
    return;
  }

  step(1, 3, `${bold(branch)} auschecken`);
  checkoutIntoWorkdir(`origin/${branch}`);

  // Kein stdin für die Kindprozesse: Deployen braucht keine Eingabe. Fragt
  // npx oder die CLI trotzdem etwas, bricht es mit Fehler ab, statt wegen
  // der gepipten stdout unsichtbar zu warten.
  // Fortschritt (stderr) bleibt sichtbar, die URL kommt über stdout.
  step(2, 3, `Bei Vercel bauen ${dim("(ca. 1–2 Min.)")}`);
  const url = vercel(["deploy", "--yes"], ["ignore", "pipe", "inherit"]).trim();
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(url)) {
    throw new Error(`Unerwartete Ausgabe von vercel deploy: ${url}`);
  }

  step(3, 3, `${bold(domain)} verknüpfen`);
  vercel(["alias", "set", url, domain], ["ignore", "inherit", "inherit"]);

  console.log(
    `\n${green(bold("✔ Fertig:"))} ${bold(cyan(`https://${domain}`))} ${dim("←")} ${branch} ${yellow(`(${sha})`)}`,
  );
}

runMain(main);
