import { isValidEmail } from './validator.js';

/**
 * 사용자 배열에서 email 필드를 추출한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {Array<string | undefined>} 추출된 이메일 목록 (없으면 undefined 포함)
 */
export function extractEmails(users) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.map((user) => user?.email);
}

/**
 * 사용자 배열에서 유효한 이메일만 필터링한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {string[]} 유효한 이메일 목록
 */
export function getValidEmails(users) {
  return extractEmails(users).filter(isValidEmail);
}

/**
 * 사용자 배열에서 유효한 이메일만 추출하고 중복을 제거한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 목록
 */
export function uniqueValidEmails(users) {
  const validEmails = getValidEmails(users);
  return [...new Set(validEmails)];
}

export { isValidEmail };
