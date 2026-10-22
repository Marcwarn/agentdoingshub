import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, sep } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const inside = (path) => {
  const absolute = resolve(root, path);
  if (!absolute.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('Path outside project');
  return absolute;
};
const manifest = JSON.parse(readFileSync(inside('transfer-parts/manifest.json'), 'utf8'));
const verified = manifest.map((file) => {
  const data = Buffer.concat(file.chunks.map((chunk) => Buffer.from(readFileSync(inside(chunk), 'utf8').trim(), 'base64')));
  if (data.length !== file.bytes || createHash('sha256').update(data).digest('hex') !== file.sha256) {
    throw new Error(`Transfer integrity check failed: ${file.path}`);
  }
  return { path: inside(file.path), data, name: file.path };
});
for (const file of verified) {
  mkdirSync(dirname(file.path), { recursive: true });
  writeFileSync(file.path, file.data);
  console.log(`Restored and verified ${file.name} (${file.data.length} bytes)`);
}
