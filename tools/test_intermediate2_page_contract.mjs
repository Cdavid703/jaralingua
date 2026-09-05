import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pageRoot = path.join(root, "ingles", "intermediate-2");
const pages = fs
  .readdirSync(pageRoot)
  .filter((name) => name.endsWith(".html"))
  .sort();

assert.equal(pages.length, 29, "Update this contract when a new Intermediate 2 page is published.");

function localStyles(markup) {
  const styles = [...markup.matchAll(/href=["']([^"']+\.css)(?:\?[^"']*)?["']/gi)]
    .map((match) => match[1])
    .filter((href) => !/^https?:/i.test(href))
    .map((href) => path.resolve(pageRoot, href))
    .filter((file) => fs.existsSync(file))
    .map((file) => fs.readFileSync(file, "utf8"));
  const inline = [...markup.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
  return [...styles, ...inline].join("\n");
}

for (const page of pages) {
  const markup = fs.readFileSync(path.join(pageRoot, page), "utf8");
  const styles = localStyles(markup);
  assert.match(markup, /<meta[^>]+name=["']viewport["'][^>]+width=device-width/i, `${page}: missing mobile viewport.`);
  assert.match(markup, /google-auth-config\.js/i, `${page}: missing shared authentication configuration.`);
  assert.match(markup, /accounts\.google\.com\/gsi\/client/i, `${page}: missing Google sign-in client.`);
  assert.match(markup, /google-auth\.js/i, `${page}: missing the visible Sign in control.`);
  assert.ok(markup.indexOf("google-auth-config.js") < markup.indexOf("google-auth.js"), `${page}: authentication scripts are out of order.`);
  assert.match(styles, /@media\s*\(max-width:\s*(?:9[0-9]{2}|8[0-9]{2}|7[0-9]{2}|6[0-9]{2}|5[0-9]{2})px\)/i, `${page}: no tablet/mobile responsive rule is reachable.`);
}

const auth = fs.readFileSync(path.join(root, "assets", "js", "google-auth.js"), "utf8");
assert.match(auth, /intermediate\(\?:-2\)\?/, "The shared auth navigation must recognize Intermediate 2 URLs.");
assert.match(auth, /@media \(max-width: 680px\)/, "The Sign in panel needs its mobile layout.");

console.log(`Intermediate 2 page contract passed: ${pages.length} pages with Sign in and responsive coverage.`);
