import {copyFile, mkdir} from 'node:fs/promises';
const target = new URL('./public/', import.meta.url);
await mkdir(target, {recursive: true});
await copyFile(new URL('../../assets/img/english-intermediate-2/unit-6/final-oral-news/studio-v1.webp', import.meta.url), new URL('studio.webp', target));
await copyFile(new URL('../../ingles/intermediate-2/audio/unit-6-final-oral-news/01-studio-chris.mp3', import.meta.url), new URL('01-studio-chris.mp3', target));
