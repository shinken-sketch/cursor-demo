import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEmails, isValidEmail, getValidEmails } from './email.js';

describe('extractEmails', () => {
  it('returns emails from user objects', () => {
    const users = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ];
    assert.deepEqual(extractEmails(users), ['alice@example.com', 'bob@example.com']);
  });

  it('returns empty array for non-array input', () => {
    assert.deepEqual(extractEmails(null), []);
    assert.deepEqual(extractEmails(undefined), []);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    assert.equal(isValidEmail('alice@example.com'), true);
    assert.equal(isValidEmail('user+tag@example.com'), true);
  });

  it('accepts RFC 5322 quoted local part and IP literal domain', () => {
    assert.equal(isValidEmail('"john.doe"@example.com'), true);
    assert.equal(isValidEmail('user@[192.168.1.1]'), true);
  });

  it('rejects invalid email addresses', () => {
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail(null), false);
    assert.equal(isValidEmail('user@example'), false);
    assert.equal(isValidEmail('user@[00.0.0.0]'), false);
  });

  it('rejects emails exceeding RFC 3696 length limits', () => {
    assert.equal(isValidEmail(`${'a'.repeat(65)}@example.com`), false);
    assert.equal(isValidEmail(`${'a'.repeat(243)}@example.com`), false);
  });
});

describe('getValidEmails', () => {
  it('returns only valid emails from users', () => {
    const users = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'not-an-email' },
      { name: 'Carol', email: 'carol@example.org' },
    ];
    assert.deepEqual(getValidEmails(users), ['alice@example.com', 'carol@example.org']);
  });

  it('returns empty array for non-array input', () => {
    assert.deepEqual(getValidEmails(undefined), []);
  });
});
