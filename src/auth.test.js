import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { login, registerUser, validateAuthConfig, verifyToken } from './auth.js';

describe('validateAuthConfig', () => {
  it('throws in production when AUTH_SECRET is missing', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.AUTH_SECRET;

    process.env.NODE_ENV = 'production';
    delete process.env.AUTH_SECRET;

    assert.throws(() => validateAuthConfig(), /AUTH_SECRET/);

    process.env.NODE_ENV = originalEnv;
    if (originalSecret !== undefined) {
      process.env.AUTH_SECRET = originalSecret;
    } else {
      delete process.env.AUTH_SECRET;
    }
  });
});

describe('login', () => {
  before(() => {
    process.env.AUTH_SECRET = 'test-secret';
    registerUser('alice@example.com', 'password123');
  });

  it('returns token for valid credentials', () => {
    const result = login('alice@example.com', 'password123');
    assert.equal(result.ok, true);
    assert.ok(typeof result.token === 'string');
  });

  it('returns generic error for invalid password', () => {
    const result = login('alice@example.com', 'wrong-password');
    assert.deepEqual(result, { ok: false, error: 'Invalid credentials' });
  });

  it('returns generic error for unknown email', () => {
    const result = login('unknown@example.com', 'password123');
    assert.deepEqual(result, { ok: false, error: 'Invalid credentials' });
  });

  it('returns generic error for invalid email format', () => {
    const result = login('not-an-email', 'password123');
    assert.deepEqual(result, { ok: false, error: 'Invalid credentials' });
  });
});

describe('verifyToken', () => {
  before(() => {
    process.env.AUTH_SECRET = 'test-secret';
  });

  it('verifies a token issued by login', () => {
    registerUser('carol@example.com', 'secret789');
    const { token } = login('carol@example.com', 'secret789');
    assert.ok(token);
    const payload = verifyToken(token);
    assert.deepEqual(payload, { email: 'carol@example.com' });
  });

  it('rejects tampered token', () => {
    registerUser('dave@example.com', 'secret000');
    const { token } = login('dave@example.com', 'secret000');
    const tampered = `${token}x`;
    assert.equal(verifyToken(tampered), null);
  });
});

describe('registerUser', () => {
  before(() => {
    process.env.AUTH_SECRET = 'test-secret';
  });

  it('allows login with newly registered user', () => {
    registerUser('bob@example.com', 'secret456');
    const result = login('bob@example.com', 'secret456');
    assert.equal(result.ok, true);
  });

  it('throws for invalid email', () => {
    assert.throws(() => registerUser('not-an-email', 'secret456'), /유효하지 않은 이메일/);
  });

  it('throws for empty password', () => {
    assert.throws(() => registerUser('eve@example.com', ''), /비밀번호/);
  });

  it('throws for non-string inputs', () => {
    assert.throws(() => registerUser(null, 'secret456'), TypeError);
    assert.throws(() => registerUser('eve@example.com', null), TypeError);
  });
});
