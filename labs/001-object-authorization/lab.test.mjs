import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startLab, stopLab } from './server.mjs';

let server, origin;
before(async () => ({ server, origin } = await startLab()));
after(async () => stopLab(server));

for (const [mode, actor, expected] of [
  ['unprotected', 'account-a', 200],
  ['unprotected', 'account-b', 200],
  ['protected', 'account-a', 200],
  ['protected', 'account-b', 403],
]) {
  test(`${mode}: ${actor} receives ${expected}`, async () => {
    const response = await fetch(`${origin}/${mode}/notes/note-alpha`, {
      headers: { 'X-Lab-User': actor },
    });
    assert.equal(response.status, expected);
    const body = await response.json();
    if (expected === 200) {
      assert.equal(body.id, 'note-alpha');
      assert.equal(body.owner, 'account-a');
    } else {
      assert.deepEqual(body, { error: 'forbidden' });
      assert.equal(Object.hasOwn(body, 'text'), false);
    }
  });
}

test('missing mock identity receives 401', async () => {
  const response = await fetch(`${origin}/protected/notes/note-alpha`);
  assert.equal(response.status, 401);
});

test('unknown mock identity receives 401', async () => {
  const response = await fetch(`${origin}/protected/notes/note-alpha`, {
    headers: { 'X-Lab-User': 'account-c' },
  });
  assert.equal(response.status, 401);
});

test('unknown object receives 404', async () => {
  const response = await fetch(`${origin}/protected/notes/missing`, {
    headers: { 'X-Lab-User': 'account-a' },
  });
  assert.equal(response.status, 404);
});

test('unsupported method receives 405', async () => {
  const response = await fetch(`${origin}/protected/notes/note-alpha`, {
    method: 'POST', headers: { 'X-Lab-User': 'account-a' },
  });
  assert.equal(response.status, 405);
});

test('server listens only on IPv4 loopback', () => {
  assert.equal(server.address().address, '127.0.0.1');
});

test('unknown route receives 404', async () => {
  const response = await fetch(`${origin}/not-a-route`);
  assert.equal(response.status, 404);
});
