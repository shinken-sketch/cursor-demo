import { createServer } from 'node:http';
import { login } from './auth.js';

const MAX_BODY_BYTES = 4096;

/**
 * 요청 URL에서 pathname만 추출한다.
 * @param {string | undefined} url - req.url
 * @returns {string} pathname
 */
function getPathname(url) {
  if (!url) {
    return '/';
  }

  const questionIndex = url.indexOf('?');
  return questionIndex === -1 ? url : url.slice(0, questionIndex);
}

/**
 * JSON 응답을 전송한다.
 * @param {import('node:http').ServerResponse} res - HTTP 응답 객체
 * @param {number} statusCode - HTTP 상태 코드
 * @param {Record<string, unknown>} body - 응답 본문
 */
function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/**
 * 요청 본문을 JSON으로 파싱한다.
 * @param {import('node:http').IncomingMessage} req - HTTP 요청 객체
 * @returns {Promise<unknown>} 파싱된 JSON
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * POST /api/login 요청을 처리한다.
 * @param {import('node:http').IncomingMessage} req - HTTP 요청 객체
 * @param {import('node:http').ServerResponse} res - HTTP 응답 객체
 */
async function handleLogin(req, res) {
  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const message = error instanceof Error && error.message === 'Payload too large'
      ? 'Payload too large'
      : 'Invalid JSON';
    sendJson(res, 400, { error: message });
    return;
  }

  const email = body?.email;
  const password = body?.password;
  const result = login(email, password);

  if (!result.ok) {
    sendJson(res, 401, { error: result.error });
    return;
  }

  sendJson(res, 200, { token: result.token });
}

/**
 * HTTP 요청 라우터.
 * @param {import('node:http').IncomingMessage} req - HTTP 요청 객체
 * @param {import('node:http').ServerResponse} res - HTTP 응답 객체
 */
async function handleRequest(req, res) {
  const { method, url } = req;
  const pathname = getPathname(url);

  if (method === 'POST' && pathname === '/api/login') {
    await handleLogin(req, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

/**
 * HTTP 서버를 생성한다.
 * @returns {import('node:http').Server} HTTP 서버 인스턴스
 */
export function createAppServer() {
  return createServer((req, res) => {
    handleRequest(req, res).catch(() => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: 'Internal server error' });
      }
    });
  });
}

/**
 * 서버를 지정 포트에서 시작한다.
 * @param {number} [port=3000] - 수신 포트
 * @param {string} [host=process.env.HOST ?? '127.0.0.1'] - 바인딩 호스트
 * @returns {import('node:http').Server} 시작된 서버
 */
export function startServer(port = 3000, host = process.env.HOST ?? '127.0.0.1') {
  const server = createAppServer();

  server.on('error', (error) => {
    console.error('서버 시작 실패:', error.message);
    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });

  return server;
}
