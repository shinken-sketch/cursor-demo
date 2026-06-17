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

### v1.1.0

**v1.1.0** — 로그인 API 엔드포인트 추가 및 인증·서버 보안 강화.

#### ✨ 기능

- **로그인 API** — `POST /api/login`으로 이메일·비밀번호 인증 후 HMAC 서명 토큰 발급
- **인증 모듈** — `src/auth.js`에 scrypt 비밀번호 해싱, 토큰 생성·검증(`createToken`, `verifyToken`), 사용자 등록(`registerUser`) 제공
- **HTTP 서버** — Node.js 내장 `http` 모듈 기반 `src/server.js` (외부 의존성 없음)
- **서버 기동** — `npm start`로 API 서버 실행 (`src/index.js`)
- **환경 변수 부트스트랩** — `BOOTSTRAP_USER_EMAIL`, `BOOTSTRAP_USER_PASSWORD`로 초기 사용자 등록
- **테스트** — `auth.test.js`, `server.test.js` 추가 (총 19개 테스트)

#### 🐛 버그 수정

- **AUTH_SECRET 강제** — 프로덕션(`NODE_ENV=production`)에서 `AUTH_SECRET` 미설정 시 서버 기동 실패; 개발 환경은 프로세스마다 랜덤 시크릿 생성
- **하드코딩 계정 제거** — 소스에 고정된 데모 계정(`alice@example.com` / `password123`) 자동 등록 삭제
- **타이밍 공격 완화** — 미등록 이메일 로그인 시에도 더미 scrypt 실행으로 응답 시간 차이 최소화
- **로컬 바인딩** — 서버 기본 수신 주소를 `127.0.0.1`로 제한 (`HOST` 환경 변수로 변경 가능)

#### 🧹 기타

- `validateAuthConfig()`, `bootstrapUsers()` 추가 — 서버 기동 전 인증 설정 검증
- 요청 본문 4KB 상한, 실패 시 동일한 `"Invalid credentials"` 메시지 유지
- 프로덕션 배포 시 `AUTH_SECRET` 필수, TLS는 리버스 프록시(nginx 등)에서 종단 권장

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
