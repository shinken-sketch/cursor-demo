# cursor-demo

사용자 목록에서 RFC 5322 기준으로 이메일을 검증·추출하는 유틸리티입니다.

## 사용법

```bash
npm test
```

```js
import { extractEmails, isValidEmail, getValidEmails } from './src/email.js';

const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'not-an-email' },
];

extractEmails(users);    // ['alice@example.com', 'not-an-email']
getValidEmails(users);   // ['alice@example.com']
isValidEmail('alice@example.com'); // true
```

## API

| 함수 | 설명 |
|------|------|
| `extractEmails(users)` | 사용자 배열에서 `email` 필드 추출 |
| `isValidEmail(email)` | RFC 5322 형식 및 RFC 3696 길이 제한 검증 |
| `getValidEmails(users)` | 유효한 이메일만 필터링 |

## 릴리스 노트

### v1.1.0

**v1.1.0** — 이메일 모듈 분리 및 RFC 5322 검증 강화, Cursor 워크플로우 규칙 추가.

#### ✨ 기능

- **`src/email.js` 모듈 분리** — `extractEmails`, `isValidEmail`, `getValidEmails`를 독립 모듈로 구성
- **RFC 5322 이메일 검증** — [emailregex.com](https://emailregex.com/) 패턴 + [Stack Overflow 채택 답변](https://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses)의 IP 옥텟 버그 수정안 반영
- **RFC 3696 길이 제한** — 로컬 파트 64자, 전체 254자 초과 시 거부
- **`getValidEmails`** — 사용자 배열에서 유효한 이메일만 필터링
- **테스트 추가** — `src/email.test.js` 7개 (추출·검증·길이 제한·필터링)
- **ES Module 전환** — `package.json` `"type": "module"`, `npm test` 스크립트 추가

#### 🐛 버그 수정

- (해당 없음)

#### 🧹 기타

- **`.cursor/rules/coding-style.mdc`** — 한국어 주석, ES Module, JSDoc, 외부 라이브러리 동의 규칙
- **`.cursor/skills/release-notes/`** — 릴리스 노트 작성 스킬 및 `collect_commits.sh` 스크립트
- `src/index.js` 엔트리포인트 단순화

### v1.0.0

**v1.0.0** — 사용자 목록에서 RFC 5322 기준으로 이메일을 검증·추출하는 유틸리티 최초 릴리스입니다.

#### ✨ 기능

- **이메일 검증** — `isValidEmail()`으로 RFC 5322 형식 및 RFC 3696 길이 제한 적용
- **이메일 추출** — `extractEmails()`로 사용자 객체 배열에서 `email` 필드 목록 추출
- **유효 이메일 필터링** — `getValidEmails()`로 검증 통과 이메일만 반환
- **테스트** — Node.js 내장 test 러너로 주요 API 커버 (`npm test`)

#### 🐛 버그 수정

- (해당 없음 — 최초 릴리스)

#### 🧹 기타

- ES Module 프로젝트 초기 구성 (`package.json`, `type: "module"`)
- Cursor 워크플로우: `release-notes` 스킬, 코딩 스타일 규칙

## Cursor 워크플로우

### 릴리스 노트 작성

`.cursor/skills/release-notes/` 스킬을 사용해 버전 간 변경 사항을 정리합니다.

```bash
# 커밋 목록 수집 (이전 태그 ~ 현재)
.cursor/skills/release-notes/scripts/collect_commits.sh v1.0.0 HEAD
```

채팅에서 `@release-notes` 또는 "릴리스 노트 작성해줘"로 스킬을 호출할 수 있습니다.
