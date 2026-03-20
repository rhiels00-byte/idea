# Killteacher

교사용 AI 퀴즈 레이드 서비스 문서는 아래 파일에 정리되어 있습니다.

- [PRD 문서](./docs/KILLTEACHER_PRD.md)

로컬 실행:

```bash
npm install
npm run dev
```

배포 전 확인:

- `VITE_GEMINI_API_KEY` 환경변수 설정
- `public/videos` 폴더 포함
- `src/Killteacher.jsx` 와 `src/killteacher/*` 포함
