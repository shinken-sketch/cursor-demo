import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEmails, isValidEmail, getValidEmails, uniqueValidEmails } from './email.js';

describe('extractEmails', () => {
    it('returns emails from member objects', () => {
        const members = [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', email: 'bob@example  example.com' },
        ];
        assert.deepEqual(extractEmails(members), ['alice@example.com', 'bob@example.com']);
    });

    it('returns empty array for non-array input', () => {
        assert.deepEqual(extractEmails(null), []);
        assert.deepEqual(extractEmails('invalid'), []);
    });
});

describe('isValidEmail', () => {
    it('accepts valid email addresses', () => {
        assert.equal(isValidEmail('alice@example.com'), true);
    });

    it('rejects invalid email addresses', () => {
        assert.equal(isValidEmail('not-an-email'), false);
        assert.equal(isValidEmail(''), false);
        assert.equal(isValidEmail(null), false);
    });
});

describe('getValidEmails', () => {
    it('returns only valid emails from members', () => {
        const members = [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', email: 'not-an-email' },
            { name: 'Carol', email: 'carol@example.org' },
        ];
        assert.deepEqual(getValidEmails(members), ['alice@example.com', 'carol@example.org']);
    });

    it('returns empty array for non-array input', () => {
        assert.deepEqual(getValidEmails(undefined), []);
    });
});

describe('uniqueValidEmails', () => {
    it('returns unique valid emails from members', () => {
        const members = [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', email: 'alice@example.com' },
            { name: 'Carol', email: 'carol@example.org' },
            { name: 'Dave', email: 'not-an-email' },
        ];
        assert.deepEqual(uniqueValidEmails(members), ['alice@example.com', 'carol@example.org']);
    });

    it('returns empty array for non-array input', () => {
        assert.deepEqual(uniqueValidEmails(null), []);
    });
});
