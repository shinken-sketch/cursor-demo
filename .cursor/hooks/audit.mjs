import { appendFileSync, mkdirSync } from 'node:fs';

const input = await new Response(process.stdin).text();
const logDir = '.cursor/hooks/logs';
const logFile = `${logDir}/audit.log`;
const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

mkdirSync(logDir, { recursive: true });
appendFileSync(logFile, `${timestamp} ${input}\n`);

try {
  const payload = JSON.parse(input);
  if (typeof payload.command === 'string') {
    console.log(JSON.stringify({ permission: 'allow' }));
  }
} catch {
  // afterFileEdit 등 command 필드가 없는 이벤트는 로그만 남긴다.
}
