import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { registerUser } from './auth.js';
import { createAppServer } from './server.js';

/**
 * 테스트용 HTTP 요청을 보낸다.
 * @param {import('node:http').Server} server - 대상 서버
 * @param {string} method - HTTP 메서드
 * @param {string} path - 요청 경로
 * @param {unknown} [body] - JSON 본문
 * @returns {Promise<{ status: number, body: Record<string, unknown> }>}
 */
function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const payload = body !== undefined ? JSON.stringify(body) : undefined;

    const req = globalThis.fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      body: payload,
    });

    req
      .then(async (res) => {
        resolve({
          status: res.status,
          body: await res.json(),
        });
      })
      .catch(reject);
  });
}

describe('POST /api/login', () => {
  /** @type {import('node:http').Server} */
  let server;

  before(async () => {
    process.env.AUTH_SECRET = 'test-secret';
    registerUser('alice@example.com', 'password123');
    server = createAppServer();
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
  });

  after(() => {
    server.close();
  });

  it('returns token for valid credentials', async () => {
    const res = await request(server, 'POST', '/api/login', {
      email: 'alice@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.token === 'string');
  });

  it('returns 401 for invalid credentials', async () => {
    const res = await request(server, 'POST', '/api/login', {
      email: 'alice@example.com',
      password: 'wrong',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid credentials');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(server, 'GET', '/api/unknown');
    assert.equal(res.status, 404);
  });

  it('handles login path with query string', async () => {
    const res = await request(server, 'POST', '/api/login?redirect=/home', {
      email: 'alice@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 200);
    assert.ok(typeof res.body.token === 'string');
  });
});
