const fs = require("fs");
const path = require("path");

function numberToFrench(number) {
  const units = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
  if (number < 20) return units[number];
  if (number === 100) return "cent";
  if (number < 70) {
    const tens = {2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante"};
    const ten = Math.floor(number/10), rest = number%10;
    return tens[ten] + (rest===0 ? "" : rest===1 ? " et un" : `-${units[rest]}`);
  }
  if (number < 80) return number===71 ? "soixante et onze" : `soixante-${units[number-60]}`;
  if (number === 80) return "quatre-vingts";
  return `quatre-vingt-${units[number-80]}`;
}

const sections = ["# Français Niveau 1 — Nombres de 1 à 100", ""];
for (let number = 1; number <= 100; number += 1) {
  sections.push(`## Nombre ${String(number).padStart(3,"0")}`);
  sections.push(`File: \`nombres-1-100/nombre-${String(number).padStart(3,"0")}.mp3\``);
  sections.push("");
  sections.push(`Narrateur: ${numberToFrench(number)}.`);
  sections.push("");
}
const output = path.resolve("frances/Niveau 1/audio/theme-1/nombres-1-100-scripts.md");
fs.writeFileSync(output, sections.join("\n"), "utf8");
console.log(output);
