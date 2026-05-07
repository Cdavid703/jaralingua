const fs = require("fs");
const path = require("path");

const root = process.cwd();
const start = path.join(root, "frances", "Niveau 7");
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(filePath);
    } else if (entry.name.endsWith(".html")) {
      files.push(filePath);
    }
  }
}

walk(start);

const broken = [];
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const re = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = re.exec(html))) {
    let url = match[1];
    if (
      url.startsWith("http") ||
      url.startsWith("mailto:") ||
      url.startsWith("#") ||
      url.startsWith("data:")
    ) {
      continue;
    }
    url = url.split("#")[0];
    if (!url) continue;
    const target = path.resolve(path.dirname(file), url);
    if (!fs.existsSync(target)) {
      broken.push(`${path.relative(root, file)} -> ${match[1]}`);
    }
  }
}

if (broken.length) {
  console.log("BROKEN");
  console.log(broken.join("\n"));
  process.exit(1);
}

console.log(`OK ${files.length} html files checked`);
