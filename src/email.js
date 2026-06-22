/**
 * 사용자 배열에서 email 필드를 추출한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {Array<string | undefined>} 추출된 이메일 목록
 */
export function extractEmails(users) {
  if (!Array.isArray(users)) {
    return [];
  }

  return users.map((user) => user?.email);
}

/**
 * RFC 5322 이메일 패턴 (주석·폴딩 공백 제외, canonical form).
 * @see https://emailregex.com/ — General Email Regex (RFC 5322 Official Standard)
 * @see https://uibakery.io/regex-library/email — RFC 5322 compliant regex
 * @see https://datatracker.ietf.org/doc/html/rfc5322
 *
 * IP 리터럴 옥텟은 원본 `[01]?[0-9][0-9]?` 대신 0–255만 허용 (00.x.x.x 거부).
 */
const RFC5322_EMAIL_REGEX =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

/** RFC 3696 로컬 파트 최대 길이 — https://datatracker.ietf.org/doc/html/rfc3696 */
const MAX_LOCAL_PART_LENGTH = 64;

/** RFC 3696 이메일 전체 최대 길이 — https://datatracker.ietf.org/doc/html/rfc3696 */
const MAX_EMAIL_LENGTH = 254;

/**
 * 이메일 문자열이 RFC 5322 형식과 RFC 3696 길이 제한을 만족하는지 검증한다.
 * @param {unknown} email - 검증할 이메일
 * @returns {boolean} 유효하면 true, 아니면 false
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const atIndex = email.lastIndexOf('@');
  if (atIndex <= 0 || atIndex > MAX_LOCAL_PART_LENGTH) {
    return false;
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return RFC5322_EMAIL_REGEX.test(email);
}

/**
 * 사용자 배열에서 유효한 이메일만 필터링한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {string[]} 유효한 이메일 목록
 */
export function getValidEmails(users) {
  return extractEmails(users).filter(isValidEmail);
}
