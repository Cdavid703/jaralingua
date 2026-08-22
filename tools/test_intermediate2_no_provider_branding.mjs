import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const publicDirectory = join(root, 'ingles', 'intermediate-2');
const catalogPath = join(root, 'assets', 'data', 'english-intermediate-2-content.json');
const providerPattern = /eleven\s*labs/i;

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(filePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [filePath] : [];
  });
}

const visibleProviderReferences = htmlFiles(publicDirectory)
  .filter((filePath) => providerPattern.test(readFileSync(filePath, 'utf8')))
  .map((filePath) => relative(root, filePath));

if (visibleProviderReferences.length) {
  throw new Error(`Public Intermediate 2 pages name the audio provider: ${visibleProviderReferences.join(', ')}`);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const studentFacingFields = ['title', 'subtitle', 'summary', 'description', 'searchKeywords'];
const catalogProviderReferences = catalog.items
  .flatMap((item) => studentFacingFields
    .filter((field) => providerPattern.test(Array.isArray(item[field]) ? item[field].join(' ') : item[field] ?? ''))
    .map((field) => `${item.id}.${field}`));

if (catalogProviderReferences.length) {
  throw new Error(`Student-facing catalog fields name the audio provider: ${catalogProviderReferences.join(', ')}`);
}

console.log(`Provider-branding check passed: ${htmlFiles(publicDirectory).length} public pages and ${catalog.items.length} catalog entries.`);
