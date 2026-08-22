import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const publicDirectory = join(root, 'ingles', 'intermediate-2');
const clientAssetDirectory = join(root, 'assets', 'js');
const catalogPath = join(root, 'assets', 'data', 'english-intermediate-2-content.json');
const providerPattern = /eleven\s*labs/i;

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(filePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [filePath] : [];
  });
}

function clientScripts(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^(english-)?intermediate2-.*\.js$/.test(entry.name))
    .map((entry) => join(directory, entry.name));
}

const visibleProviderReferences = htmlFiles(publicDirectory)
  .filter((filePath) => providerPattern.test(readFileSync(filePath, 'utf8')))
  .map((filePath) => relative(root, filePath));

if (visibleProviderReferences.length) {
  throw new Error(`Public Intermediate 2 pages name the audio provider: ${visibleProviderReferences.join(', ')}`);
}

const clientProviderReferences = clientScripts(clientAssetDirectory)
  .filter((filePath) => providerPattern.test(readFileSync(filePath, 'utf8')))
  .map((filePath) => relative(root, filePath));

if (clientProviderReferences.length) {
  throw new Error(`Intermediate 2 client scripts name the audio provider: ${clientProviderReferences.join(', ')}`);
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

console.log(`Provider-branding check passed: ${htmlFiles(publicDirectory).length} public pages, ${clientScripts(clientAssetDirectory).length} client scripts and ${catalog.items.length} catalog entries.`);
