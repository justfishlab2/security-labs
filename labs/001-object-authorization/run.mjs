import fs from 'node:fs/promises';
import path from 'node:path';
import { startLab, stopLab } from './server.mjs';

const output = process.argv[2] || 'artifacts/lab-001.json';
const { server, origin } = await startLab();
try {
  const runs = [];
  for (const [mode, actor] of [
    ['unprotected', 'account-a'], ['unprotected', 'account-b'],
    ['protected', 'account-a'], ['protected', 'account-b'],
  ]) {
    const endpoint = `/${mode}/notes/note-alpha`;
    const response = await fetch(origin + endpoint, { headers: { 'X-Lab-User': actor } });
    const body = await response.json();
    runs.push({ mode, actor, path: endpoint, status: response.status, body });
  }
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify({
    type: 'owned synthetic local lab',
    implementation: 'refactored teaching version',
    boundTo: '127.0.0.1',
    runAt: new Date().toISOString(),
    runs,
  }, null, 2) + '\n');
  console.table(runs.map(({ mode, actor, status }) => ({ mode, actor, status })));
  console.log(`Evidence written to ${output}`);
} finally {
  await stopLab(server);
}
