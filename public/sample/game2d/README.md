# Elementary Boss Canvas Demo

영상에서 추출한 프레임을 임시 스프라이트 시트로 묶고, React + Canvas 상태머신으로 제어하는 샘플이다.

## 실행

```bash
npm install
npm run dev
```

## 현재 상태

- idle: 루프
- hit: 1회 재생
- recover: 1회 재생 후 idle 복귀

## 다음 확장 포인트

1. `attack`, `die`, `stun`, `skill` 상태 추가
2. 캐릭터 PNG만 별도 추출해서 진짜 투명 스프라이트로 교체
3. 피격 판정 / 투사체 / 충돌 박스 분리
4. 사운드, 카메라 줌, 보스 패턴, 타이머 추가

## 파일 구조

- `src/components/GameCanvas.jsx`: 렌더링, 상태머신, 이펙트
- `src/lib/animationConfig.js`: 애니메이션 메타
- `public/sprites/*.png`: 영상 기반 임시 스프라이트 시트

## 주의

현재 스프라이트는 영상 크롭본이어서 바닥/이펙트가 프레임 안에 포함되어 있다.
실서비스 단계에서는 캐릭터만 분리한 아트 리소스로 교체하는 것이 맞다.
