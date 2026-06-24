const fs = require("fs");
const path = require("path");

const root = path.resolve("frances/Niveau 1");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]
  ));
}

const missing = [];
for (const file of walk(root)) {
  if (!file.endsWith(".html")) continue;
  if (file.includes(`${path.sep}_fuentes${path.sep}`)) continue;
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1];
    if (raw.includes("${")) continue;
    const target = raw.split(/[?#]/)[0];
    if (!target || /^(?:https?:|data:|mailto:|\/)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) missing.push(`${path.relative(root, file)} -> ${raw}`);
  }
}

if (missing.length) {
  console.error(missing.join("\n"));
  process.exit(1);
}
console.log("OK: all local links and assets exist");


