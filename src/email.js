import { isValidEmail } from './validator.js';

/**
 * 사용자 배열에서 email 필드를 추출한다.
 * @param {unknown} members - 사용자 객체 배열
 * @returns {string[]} 추출된 이메일 목록
 */
export function extractEmails(members) {
  if (!Array.isArray(members)) {
    return [];
  }
  return members.map((member) => member.email);
}

/**
 * 사용자 배열에서 유효한 이메일만 필터링한다.
 * @param {unknown} members - 사용자 객체 배열
 * @returns {string[]} 유효한 이메일 목록
 */
export function getValidEmails(members) {
  return extractEmails(members).filter(isValidEmail);
}

/**
 * 사용자 배열에서 유효한 이메일만 추출하고 중복을 제거한다.
 * @param {unknown} members - 사용자 객체 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 목록
 */
export function uniqueValidEmails(members) {
  return [...new Set(getValidEmails(members))];
}

export { isValidEmail };
