// Generate a short paper-rustle WAV for native mobile audio playback.
const fs = require('node:fs');
const path = require('node:path');
const rate = 44100;
const count = Math.floor(rate * 0.38);
const pcm = Buffer.alloc(count * 2);
let seed = 519;
let low = 0;
for (let i = 0; i < count; i++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const noise = seed / 2147483648 - 1;
  low = 0.8 * low + 0.2 * noise;
  const t = i / rate;
  const sweep = Math.sin(Math.PI * Math.min(1, t / 0.30)) ** 1.4;
  const second = t > 0.22 ? Math.sin(Math.PI * Math.min(1, (t - 0.22) / 0.16)) ** 2 : 0;
  const value = Math.max(-1, Math.min(1, (noise - low) * (0.52 * sweep + 0.18 * second)));
  pcm.writeInt16LE(Math.round(value * 32767), i * 2);
}
const header = Buffer.alloc(44);
header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVE', 8); header.write('fmt ', 12); header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28);
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(path.join(__dirname, '../ingles/basico-2/audio/unit5/goldilocks-book/page-turn.wav'), Buffer.concat([header, pcm]));
