import { validateAuthConfig, bootstrapUsers } from './auth.js';
import { startServer } from './server.js';

/**
 * 환경 변수 PORT 값을 유효한 포트 번호로 파싱한다.
 * @param {string | undefined} value - process.env.PORT
 * @param {number} [defaultPort=3000] - 기본 포트
 * @returns {number} 파싱된 포트 번호
 */
function parsePort(value, defaultPort = 3000) {
  if (value === undefined || value === '') {
    return defaultPort;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`유효하지 않은 PORT: ${value}`);
  }

  return port;
}

validateAuthConfig();
bootstrapUsers();
startServer(parsePort(process.env.PORT));
