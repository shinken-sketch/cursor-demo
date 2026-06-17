import { getValidEmails } from './email.js';

console.log('hello cursor');

const members = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'not-an-email' },
];

console.log(getValidEmails(members));
