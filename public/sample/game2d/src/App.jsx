import GameCanvas from './components/GameCanvas'

export default function App() {
  return (
    <div className="app-shell">
      <div className="panel intro">
        <div>
          <p className="eyebrow">Elementary Boss Demo</p>
          <h1>캐릭터형 2D 게임 구조 / React + Canvas</h1>
          <p className="desc">
            영상에서 추출한 프레임을 임시 스프라이트로 묶고, Canvas 위에서
            상태머신으로 제어하는 구조다. 지금은 <strong>idle → hit → recover</strong>
            순환이 중심이고, 이후 attack / die / stun / skill 상태를 그대로 확장하면 된다.
          </p>
        </div>
        <div className="controls-help">
          <span>Space / 버튼: Hit</span>
          <span>R: Reset</span>
          <span>자동 루프: On</span>
        </div>
      </div>

      <div className="panel game-wrap">
        <GameCanvas />
      </div>
    </div>
  )
}
