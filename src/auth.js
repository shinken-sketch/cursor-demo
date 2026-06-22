import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { isValidEmail } from './email.js';

/** @type {Map<string, { passwordHash: Buffer, salt: Buffer }>} */
const users = new Map();

const TOKEN_TTL_MS = 60 * 60 * 1000;
const SCRYPT_KEY_LENGTH = 64;

/** 타이밍 공격 완화용 더미 자격 증명 */
const DUMMY_CREDENTIALS = hashPassword('__dummy__');

/** @type {string | null} */
let cachedDevSecret = null;

/**
 * 환경 변수 또는 개발용 랜덤 키에서 토큰 서명 키를 반환한다.
 * 프로덕션에서는 AUTH_SECRET 미설정 시 예외를 던진다.
 * @returns {string} HMAC 서명 키
 */
function getSigningSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET 환경 변수가 필요합니다.');
  }

  if (!cachedDevSecret) {
    cachedDevSecret = randomBytes(32).toString('hex');
  }

  return cachedDevSecret;
}

/**
 * 인증 설정을 검증한다. 서버 기동 전에 호출한다.
 */
export function validateAuthConfig() {
  getSigningSecret();
}

/**
 * 비밀번호를 scrypt로 해시한다.
 * @param {string} password - 평문 비밀번호
 * @param {Buffer} [salt] - 솔트 (생략 시 새로 생성)
 * @returns {{ passwordHash: Buffer, salt: Buffer }}
 */
export function hashPassword(password, salt = randomBytes(16)) {
  const passwordHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return { passwordHash, salt };
}

/**
 * 저장된 해시와 입력 비밀번호를 타이밍 안전하게 비교한다.
 * @param {string} password - 입력 비밀번호
 * @param {Buffer} storedHash - 저장된 해시
 * @param {Buffer} salt - 저장된 솔트
 * @returns {boolean} 일치하면 true
 */
export function verifyPassword(password, storedHash, salt) {
  const { passwordHash } = hashPassword(password, salt);
  if (passwordHash.length !== storedHash.length) {
    return false;
  }
  return timingSafeEqual(passwordHash, storedHash);
}

/**
 * 사용자를 등록한다.
 * @param {string} email - 이메일
 * @param {string} password - 평문 비밀번호
 * @throws {TypeError} email 또는 password가 문자열이 아닌 경우
 * @throws {Error} 이메일 형식이 유효하지 않거나 비밀번호가 비어 있는 경우
 */
export function registerUser(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new TypeError('email과 password는 문자열이어야 합니다.');
  }

  if (!isValidEmail(email)) {
    throw new Error('유효하지 않은 이메일입니다.');
  }

  if (password.length === 0) {
    throw new Error('비밀번호는 비어 있을 수 없습니다.');
  }

  users.set(email.toLowerCase(), hashPassword(password));
}

/**
 * 환경 변수로 지정된 부트스트랩 사용자를 등록한다.
 * BOOTSTRAP_USER_EMAIL과 BOOTSTRAP_USER_PASSWORD가 모두 설정된 경우에만 등록한다.
 */
export function bootstrapUsers() {
  const email = process.env.BOOTSTRAP_USER_EMAIL;
  const password = process.env.BOOTSTRAP_USER_PASSWORD;

  if (email && password) {
    registerUser(email, password);
    return;
  }

  if (email || password) {
    throw new Error('BOOTSTRAP_USER_EMAIL와 BOOTSTRAP_USER_PASSWORD는 함께 설정해야 합니다.');
  }
}

/**
 * 이메일과 비밀번호로 로그인을 시도한다.
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {{ ok: true, token: string } | { ok: false, error: string }}
 */
export function login(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { ok: false, error: 'Invalid credentials' };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const normalizedEmail = email.toLowerCase();
  const user = users.get(normalizedEmail);
  const credentials = user ?? DUMMY_CREDENTIALS;
  const passwordValid = verifyPassword(password, credentials.passwordHash, credentials.salt);

  if (!user || !passwordValid) {
    return { ok: false, error: 'Invalid credentials' };
  }

  return { ok: true, token: createToken(normalizedEmail) };
}

/**
 * 로그인 토큰을 생성한다.
 * @param {string} email - 사용자 이메일
 * @returns {string} 서명된 토큰
 */
export function createToken(email) {
  const payload = {
    sub: email,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

/**
 * 토큰을 검증하고 페이로드를 반환한다.
 * @param {string} token - 검증할 토큰
 * @returns {{ email: string } | null} 유효하면 이메일, 아니면 null
 */
export function verifyToken(token) {
  if (typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encoded, signature] = parts;
  const expectedSignature = createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    return null;
  }

  return { email: payload.sub };
}
