# Killteacher PRD

## 1. 제품 개요

### 제품명
Killteacher

### 한 줄 설명
교사가 과목과 주제를 입력하면 AI가 실제 수업용 문항을 만들고, 학생들이 레이드 게임처럼 문제를 풀며 보스를 쓰러뜨리는 실시간 수업 참여 서비스.

### 제품 목적
- 수업 도입과 정리 시간을 더 몰입감 있게 만든다.
- 문제 풀이를 게임화해 학생 참여도를 높인다.
- 교사가 별도 제작 도구 없이 바로 문항을 생성하고 진행할 수 있게 한다.

### 핵심 가치
- AI 기반 빠른 문항 생성
- 교사용/학생용 화면 분리
- 보스 HP, 타격 로그, 랭킹 중심의 게임형 수업 경험
- 수업 종료 후 기여도 기반 칭호와 뱃지 제공

## 2. 타깃 사용자

### 주요 사용자
- 초등, 중등, 고등 교사
- 수업에 참여하는 학생

### 사용 상황
- 단원 도입 퀴즈
- 형성평가
- 복습 수업
- 팀 기반 참여형 활동

## 3. 사용자 문제

### 교사 관점
- 수업 전에 퀴즈를 만드는 데 시간이 오래 걸린다.
- 학생 참여를 끌어내기 어렵다.
- 문제 풀이 결과를 한눈에 보여주기 어렵다.

### 학생 관점
- 일반 퀴즈는 지루하게 느껴질 수 있다.
- 내 기여도가 드러나지 않는다.
- 수업 참여의 재미 요소가 부족하다.

## 4. 제품 목표

### 목표
- 교사가 1분 이내에 레이드 퀴즈 세션을 만들 수 있게 한다.
- 학생이 입장 후 바로 게임 맥락을 이해할 수 있게 한다.
- 문제 풀이 결과가 즉시 보스 HP, 공격 로그, 랭킹에 반영되게 한다.

### 성공 기준
- 교사가 과목과 주제 입력 후 문항 생성 가능
- 학생 최대 5명 입장 가능
- 교사 시작 시 학생 화면도 자동 전환
- 정답 제출 시 HP 감소, 로그, 랭킹 반영
- 종료 후 칭호와 뱃지 생성

## 5. 핵심 사용자 흐름

### 교사 흐름
1. 교사가 학급명, 학교급, 학년, 과목, 주제/키워드, 문항 수를 입력한다.
2. AI 문항 생성 버튼을 눌러 보스와 문제를 만든다.
3. QR 코드 또는 학생 링크를 통해 학생을 입장시킨다.
4. 학생 수를 확인하고 게임을 시작한다.
5. 문제 진행 중 현재 문항, 보스 HP, 타격 로그, 실시간 랭킹을 확인한다.
6. 게임 종료 후 최종 랭킹과 칭호/뱃지를 확인한다.

### 학생 흐름
1. 학생이 링크 또는 QR로 접속한다.
2. 닉네임과 이모지 캐릭터를 선택한다.
3. 대기실에 입장한다.
4. 교사가 시작하면 게임 화면으로 전환된다.
5. 문항을 풀고 정답 제출 시 보스 공격 결과를 본다.
6. 종료 후 개인 기여도, 칭호, 뱃지를 확인한다.

## 6. 주요 기능 요구사항

### 6.1 AI 문항 생성
- 입력값: 학급명, 학교급, 학년, 과목, 주제/키워드, 문항 수
- Gemini API를 사용해 문항과 보스 정보를 생성한다.
- 주제가 `덧셈과 뺄셈` 같은 계산형이면 실제 숫자 문제를 만들도록 유도한다.
- Gemini 호출 실패 시 fallback 문항을 생성한다.

### 6.2 게임 세션 생성
- 세션 ID를 URL query parameter로 관리한다.
- 교사 화면과 학생 화면이 같은 세션을 공유한다.
- `localStorage`와 `BroadcastChannel`로 상태를 동기화한다.

### 6.3 교사용 화면
- 입력 폼 제공
- QR 코드 제공
- 학생 참여 현황 표시
- 현재 문제, 보스 연출, HP 바, 타격 로그, 실시간 랭킹 표시
- 데모 학생 5명 자동 채우기 기능 제공

### 6.4 학생용 화면
- 닉네임 입력
- 이모지 캐릭터 선택
- 대기실 화면
- 문제 풀이 화면
- 실시간 랭킹 확인
- 종료 후 개인 칭호 및 뱃지 확인

### 6.5 보스 연출
- 학교급에 따라 서로 다른 영상 사용
- `public/videos/elementary.mp4`
- `public/videos/middle.mp4`
- `public/videos/high.mp4`
- 피격 시 데미지 표기와 확대 애니메이션 제공

### 6.6 랭킹 및 보상
- 누적 데미지, 정답 수, 정확도를 기준으로 랭킹 계산
- 게임 종료 후 Gemini로 학생별 칭호와 뱃지 생성
- 실패 시 fallback 칭호/뱃지 사용

## 7. 현재 구현 범위

### 포함된 것
- 교사용/학생용 화면 분리
- AI 문항 생성
- 계산형 키워드 fallback 지원
- QR 코드 생성
- 학생 최대 5명 제한
- 데미지, HP, 로그, 랭킹 반영
- 종료 후 칭호와 뱃지 노출
- 영상 기반 보스 연출

### 아직 없는 것
- 여러 기기 간 완전한 서버 기반 실시간 동기화
- 교사 강제 정답 공개 기능
- 학생 접속 인증
- 학습 결과 저장 백엔드
- 운영용 관리자 페이지

## 8. 기술 구조

### 프론트엔드
- React
- Vite
- Tailwind CSS
- lucide-react
- qrcode.react

### 상태/동기화
- React hook 기반 상태 관리
- `BroadcastChannel`
- `localStorage`

### AI 연동
- Gemini API
- 환경변수: `VITE_GEMINI_API_KEY`

## 9. 파일 구조와 역할

### 진입 파일
- [src/main.jsx](/Users/lisa/Desktop/idea/src/main.jsx)
  - 앱의 실제 entry point
  - 현재는 `Killteacher`만 바로 렌더링

- [src/Killteacher.jsx](/Users/lisa/Desktop/idea/src/Killteacher.jsx)
  - 교사/학생 화면 분기
  - 세션 ID 생성 및 URL 동기화
  - 공용 상태 훅 연결

### 교사/학생 화면
- [src/killteacher/TeacherRaidScreen.jsx](/Users/lisa/Desktop/idea/src/killteacher/TeacherRaidScreen.jsx)
  - 교사용 메인 UI
  - 문항 생성 폼
  - QR 코드
  - 학생 목록
  - 보스 아레나
  - 타격 로그
  - 실시간 랭킹
  - 종료 화면

- [src/killteacher/StudentRaidScreen.jsx](/Users/lisa/Desktop/idea/src/killteacher/StudentRaidScreen.jsx)
  - 학생용 메인 UI
  - 닉네임/이모지 선택
  - 대기실
  - 문제 풀이 화면
  - 개인 참여 상태
  - 최종 결과 확인

### 게임 로직
- [src/killteacher/useRaidSession.js](/Users/lisa/Desktop/idea/src/killteacher/useRaidSession.js)
  - 세션 전체 상태 정의
  - 학생 입장 처리
  - 데미지 계산
  - 문제 진행
  - HP 감소
  - 로그/랭킹 계산
  - 데모 학생 5명 채우기
  - 종료 시 보상 생성

### AI 로직
- [src/killteacher/gemini.js](/Users/lisa/Desktop/idea/src/killteacher/gemini.js)
  - Gemini API 호출
  - 문항 생성 프롬프트
  - 칭호/뱃지 생성 프롬프트
  - fallback 문항 및 fallback 보상 생성

### 스타일/정적 파일
- [src/index.css](/Users/lisa/Desktop/idea/src/index.css)
  - 전역 스타일 진입점

- [public/videos/elementary.mp4](/Users/lisa/Desktop/idea/public/videos/elementary.mp4)
- [public/videos/middle.mp4](/Users/lisa/Desktop/idea/public/videos/middle.mp4)
- [public/videos/high.mp4](/Users/lisa/Desktop/idea/public/videos/high.mp4)
  - 학교급별 보스 연출 영상

## 10. 수정할 때 어디를 보면 되는가

### 교사 화면을 바꾸고 싶을 때
- `TeacherRaidScreen.jsx`

### 학생 화면을 바꾸고 싶을 때
- `StudentRaidScreen.jsx`

### 게임 규칙을 바꾸고 싶을 때
- `useRaidSession.js`

### AI가 만드는 문항/보상 내용을 바꾸고 싶을 때
- `gemini.js`

### 세션 분기나 진입 구조를 바꾸고 싶을 때
- `Killteacher.jsx`

## 11. 배포 체크리스트

- `npm install`
- `VITE_GEMINI_API_KEY` 설정
- `public/videos` 포함
- `src/Killteacher.jsx` 포함
- `src/killteacher/*` 포함
- `npm run build` 통과 확인

## 12. 향후 개선 아이디어

- Firebase 또는 Supabase 기반 다기기 실시간 동기화
- 문제 정답/해설 교사 제어 기능
- 학생별 학습 기록 저장
- 과목별 보스 스킨 분리
- 음향 효과와 더 강한 타격 모션
- 결과 리포트 다운로드
