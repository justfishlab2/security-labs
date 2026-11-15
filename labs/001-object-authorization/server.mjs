import http from 'node:http';

// Educational mock identities only. A client-controlled header is NOT authentication.
const ACTORS = new Set(['account-a', 'account-b']);
const note = Object.freeze({
  id: 'note-alpha',
  owner: 'account-a',
  text: 'Synthetic test note; no real user data.',
});

export function createLabServer() {
  return http.createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    const send = (status, body) => {
      response.writeHead(status);
      response.end(JSON.stringify(body));
    };

    if (request.method !== 'GET') return send(405, { error: 'method_not_allowed' });
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const match = /^\/(unprotected|protected)\/notes\/([^/]+)$/.exec(pathname);
    if (!match) return send(404, { error: 'not_found' });

    const actor = request.headers['x-lab-user'];
    if (!ACTORS.has(actor)) return send(401, { error: 'authentication_required' });
    if (match[2] !== note.id) return send(404, { error: 'not_found' });

    // Intentionally missing in /unprotected: the object ownership decision.
    // Production applications must derive identity from verified sessions/tokens.
    if (match[1] === 'protected' && actor !== note.owner) {
      return send(403, { error: 'forbidden' });
    }
    return send(200, note);
  });
}

export async function startLab() {
  const server = createLabServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

export async function stopLab(server) {
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
}
