# cursor-demo

사용자 목록에서 RFC 5322 기준으로 이메일을 검증·추출하는 유틸리티입니다.

## 사용법

```bash
npm test
```

```js
import { getValidEmails, uniqueValidEmails } from './src/email.js';

const members = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'not-an-email' },
];

getValidEmails(members);       // ['alice@example.com']
uniqueValidEmails(members);    // ['alice@example.com']
```

## API

| 함수 | 설명 |
|------|------|
| `isValidEmail(email)` | RFC 5322 형식 및 RFC 3696 길이 제한 검증 |
| `extractEmails(members)` | 사용자 배열에서 `email` 필드 추출 |
| `getValidEmails(members)` | 유효한 이메일만 필터링 |
| `uniqueValidEmails(members)` | 유효 이메일 중복 제거 |

자세한 검증 규칙은 [`docs/validator.md`](docs/validator.md)를 참고하세요.

## 릴리스 노트

### v1.0.0

**v1.0.0** — 사용자 목록에서 RFC 5322 기준으로 이메일을 검증·추출하는 유틸리티 최초 릴리스입니다.

#### ✨ 기능

- **이메일 검증** — `isValidEmail()`으로 RFC 5322 형식 및 RFC 3696 길이 제한(로컬 파트 64자, 전체 254자) 적용
- **이메일 추출** — `extractEmails()`로 사용자 객체 배열에서 `email` 필드 목록 추출
- **유효 이메일 필터링** — `getValidEmails()`로 검증 통과 이메일만 반환
- **중복 제거** — `uniqueValidEmails()`로 유효 이메일 중복 제거
- **테스트** — Node.js 내장 test 러너로 주요 API 커버 (`npm test`)

#### 🐛 버그 수정

- (해당 없음 — 최초 릴리스)

#### 🧹 기타

- ES Module 프로젝트 초기 구성 (`package.json`, `type: "module"`)
- `docs/validator.md` 이메일 검증 스펙 문서 추가
- Cursor 워크플로우: `release-notes` 스킬, `prep-pr` 커맨드, 코딩 스타일 규칙
