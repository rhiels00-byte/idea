import { useMemo } from 'react';
import {
  Crown,
  Gauge,
  QrCode,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import BossCanvas from './BossCanvas';

const ArenaCard = ({ raid, currentQuestion }) => {
  const { state } = raid;

  return (
    <div className="rounded-[32px] border border-orange-400/20 bg-slate-950/80 p-6 shadow-2xl shadow-orange-950/30">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-300">Teacher Arena</p>
          <h2 className="mt-2 text-3xl font-black text-white">{state.boss.name}</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300">{state.boss.summary}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
          <BossCanvas
            level={state.config.level}
            bossHp={state.bossHp}
            lastAttack={state.lastAttack}
            lastMiss={state.lastMiss}
            bossName={state.boss.name}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>약점: {state.boss.weakness}</span>
            <span>남은 문제 {Math.max(state.questions.length - state.currentQuestionIndex, 0)}개</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-cyan-200">
              <Gauge size={18} />
              <span className="text-sm font-semibold">현재 문항</span>
            </div>
            {currentQuestion ? (
              <>
                <p className="text-lg font-bold text-white">
                  Q{state.currentQuestionIndex + 1}. {currentQuestion.prompt}
                </p>
                <div className="mt-4 grid gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={option}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200"
                    >
                      {index + 1}. {option}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-300">문항이 아직 준비되지 않았습니다.</p>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-200">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">실시간 타격 로그</span>
            </div>
            <div className="space-y-3">
              {state.logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/80 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{log.avatar}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{log.name}</p>
                      <p className="text-xs text-slate-400">{log.text}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-rose-300">
                    {log.correct ? `-${log.damage}` : 'MISS'}
                  </span>
                </div>
              ))}
              {state.logs.length === 0 && (
                <p className="text-sm text-slate-400">학생의 첫 정답을 기다리는 중입니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherRaidScreen = ({ sessionId, raid }) => {
  const { state, currentQuestion } = raid;

  const joinUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.pathname = '/killteacher/student';
    url.searchParams.set('session', sessionId);
    return url.toString();
  }, [sessionId]);

  const topPlayer = state.rankings?.[0];

  const configLabel = [
    state.config.level,
    state.config.grade ? `${state.config.grade}학년` : '',
    state.config.classroom,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1d4ed833,transparent_35%),radial-gradient(circle_at_bottom,#ea580c22,transparent_30%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-300">Teacher Command</p>
            <h1 className="mt-2 text-4xl font-black">선생님을 쓰러트려라</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              선생님이 문항을 만들고, QR로 학생을 입장시키고, 레이드 수업을 실시간으로 진행하는 화면입니다.
            </p>
          </div>
          <a
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100"
          >
            학생 화면 새 창 열기
          </a>
        </div>

        {state.phase === 'SETUP' && (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7">
              <div className="mb-6 flex items-center gap-3">
                <Shield size={20} className="text-cyan-300" />
                <h2 className="text-2xl font-bold">문항 만들기</h2>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">학교급</span>
                  <select
                    value={state.config.level}
                    onChange={(event) => raid.updateConfig({ level: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                  >
                    {['초등', '중등', '고등'].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">학년</span>
                  <input
                    value={state.config.grade}
                    onChange={(event) => raid.updateConfig({ grade: event.target.value })}
                    placeholder="예: 3"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">학급명</span>
                  <input
                    value={state.config.classroom}
                    onChange={(event) => raid.updateConfig({ classroom: event.target.value })}
                    placeholder="예: 2반"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">과목과 단원</span>
                  <input
                    value={state.config.subject}
                    onChange={(event) => raid.updateConfig({ subject: event.target.value })}
                    placeholder="예: 수학"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">주제/키워드</span>
                  <input
                    value={state.config.topic}
                    onChange={(event) => raid.updateConfig({ topic: event.target.value })}
                    placeholder="예: 덧셈과 뺄셈, 두 자리 수 계산"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">문항 수</span>
                  <select
                    value={state.config.qCount}
                    onChange={(event) => raid.updateConfig({ qCount: Number(event.target.value) })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                  >
                    {[5, 8, 10].map((count) => (
                      <option key={count} value={count}>
                        {count}문항
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={raid.generateQuestions}
                  disabled={
                    raid.isGenerating ||
                    !state.config.grade.trim() ||
                    !state.config.subject.trim() ||
                    !state.config.topic.trim()
                  }
                  className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-lg font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-cyan-100"
                >
                  {raid.isGenerating ? 'AI가 문항 생성 중...' : 'AI 문항 생성하기'}
                </button>
              </div>
            </div>

            <div className="rounded-[32px] border border-orange-300/20 bg-orange-500/10 p-7">
              <div className="mb-5 flex items-center gap-3">
                <Swords size={20} className="text-orange-200" />
                <h2 className="text-2xl font-bold">레이드 프리뷰</h2>
              </div>
              <div className="rounded-[28px] border border-orange-200/15 bg-slate-950/80 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-200">
                      {configLabel || '학교급과 학년을 선택하세요'}
                    </p>
                    <p className="mt-2 text-3xl font-black">{state.config.subject || '과목을 입력하세요'}</p>
                    <p className="mt-2 text-sm text-slate-300">{state.config.topic || '주제를 입력하세요'}</p>
                  </div>
                  <div className="text-7xl">{state.boss.avatar}</div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Teacher Theme</p>
                    <p className="mt-2 font-semibold">{state.boss.title}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Question Count</p>
                    <p className="mt-2 font-semibold">{state.config.qCount} 문제</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Engine</p>
                    <p className="mt-2 font-semibold">Gemini Quiz Builder</p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-slate-300">
                  현재 구현은 프런트엔드 중심 실전 데모입니다. 같은 브라우저의 여러 탭에서는 자동 동기화되며, 여러 기기 동기화는 추후 공용 백엔드를 붙이면 확장할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {state.phase === 'LOBBY' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7">
              <div className="mb-5 flex items-center gap-3">
                <QrCode size={20} className="text-cyan-300" />
                <h2 className="text-2xl font-bold">QR 입장</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-[280px_1fr]">
                <div className="rounded-[28px] bg-white p-4">
                  <QRCodeSVG value={joinUrl} width="100%" height="100%" includeMargin />
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">학생 접속 링크</p>
                    <p className="mt-3 break-all text-sm text-slate-200">{joinUrl}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-300">
                      학생은 닉네임과 이모지를 고른 뒤 대기실에 입장합니다. 선생님이 시작을 누르면 학생 화면도 즉시 게임 화면으로 바뀝니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={raid.fillDemoStudents}
                    className="w-full rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold text-slate-100 hover:bg-white/5"
                  >
                    데모 학생 5명 채우기
                  </button>
                  <button
                    type="button"
                    onClick={raid.startGame}
                    className="w-full rounded-2xl bg-orange-400 px-5 py-4 text-lg font-black text-slate-950 transition hover:bg-orange-300"
                  >
                    레이드 시작
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7">
              <div className="mb-5 flex items-center gap-3">
                <Users size={20} className="text-emerald-300" />
                <h2 className="text-2xl font-bold">참여 학생</h2>
              </div>
              <div className="space-y-3">
                {state.rankings.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-3xl border border-white/5 bg-slate-950/70 px-4 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{student.avatar}</span>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-slate-400">대기 중</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      READY
                    </span>
                  </div>
                ))}
                {state.rankings.length === 0 && (
                  <p className="text-sm text-slate-400">학생 입장을 기다리는 중입니다. 데모 버튼으로 5명을 바로 채울 수도 있어요.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {state.phase === 'PLAY' && (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <ArenaCard raid={raid} currentQuestion={currentQuestion} />

            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6">
                <div className="mb-4 flex items-center gap-3 text-amber-200">
                  <Crown size={18} />
                  <h3 className="text-xl font-bold">실시간 랭킹</h3>
                </div>
                <div className="space-y-3">
                  {state.rankings.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/80 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-orange-300">#{index + 1}</span>
                        <span className="text-2xl">{student.avatar}</span>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-xs text-slate-400">
                            정답 {student.correctCount}개 · 정확도 {student.accuracy}%
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-rose-300">{student.totalDamage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6">
                <div className="mb-4 flex items-center gap-3 text-cyan-200">
                  <Trophy size={18} />
                  <h3 className="text-xl font-bold">선생님 제어</h3>
                </div>
                <button
                  type="button"
                  onClick={raid.nextQuestion}
                  className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-lg font-black text-slate-950 hover:bg-cyan-300"
                >
                  다음 문항으로 이동
                </button>
                <button
                  type="button"
                  onClick={raid.resetSession}
                  className="mt-3 w-full rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold text-slate-200 hover:bg-white/5"
                >
                  세션 리셋
                </button>
                {topPlayer && (
                  <div className="mt-5 rounded-3xl border border-orange-300/20 bg-orange-500/10 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-orange-200">현재 MVP</p>
                    <p className="mt-2 text-xl font-black">
                      {topPlayer.avatar} {topPlayer.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      누적 데미지 {topPlayer.totalDamage} · 정답 {topPlayer.correctCount}개
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {state.phase === 'RESULT' && (
          <div className="rounded-[36px] border border-amber-300/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(15,23,42,0.95))] p-8 shadow-2xl">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200">
                {state.bossHp <= 0 ? 'Raid Clear' : 'Raid Failed'}
              </p>
              <h2 className="mt-3 text-5xl font-black">
                {state.bossHp <= 0 ? '선생님 처치 성공!' : '선생님이 살아남았다!'}
              </h2>
              <p className="mt-3 text-lg text-slate-200">
                {state.bossHp <= 0
                  ? topPlayer
                    ? `${topPlayer.name} 학생이 가장 큰 기여를 했습니다.`
                    : '팀의 협동으로 선생님을 물리쳤습니다.'
                  : '아쉽지만 선생님을 쓰러뜨리지 못했어요. 그래도 모두의 기여를 확인해보세요.'}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {state.rankings.map((student, index) => {
                const reward = state.rewards.find((item) => item.studentId === student.id);
                return (
                  <div
                    key={student.id}
                    className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-amber-300">#{index + 1}</span>
                      <span className="text-4xl">{student.avatar}</span>
                    </div>
                    <p className="mt-4 text-2xl font-black">{student.name}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      총 데미지 {student.totalDamage} · 정답 {student.correctCount}개 · 정확도 {student.accuracy}%
                    </p>
                    <div className="mt-4 rounded-2xl bg-amber-400/10 px-4 py-3">
                      <p className="text-lg font-bold text-amber-200">
                        {reward?.badge || '🏅'} {reward?.title || '팀 전사'}
                      </p>
                      <p className="mt-2 text-sm text-slate-200">{reward?.summary}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={raid.resetSession}
              className="mt-8 w-full rounded-2xl bg-white px-6 py-4 text-lg font-black text-slate-950 hover:bg-amber-100"
            >
              새 게임 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherRaidScreen;
