import { useMemo, useState } from 'react';
import { Crown, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import BossCanvas from './BossCanvas';

const PlayerArena = ({ raid, currentQuestion, player }) => {
  const { state } = raid;

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300">Student View</p>
          <h2 className="mt-2 text-3xl font-black">{state.boss.name}</h2>
          <p className="mt-2 text-sm text-slate-300">{state.boss.summary}</p>
        </div>
        <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">내 캐릭터</p>
          <p className="mt-1 text-3xl">{player?.avatar || '🙂'}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <BossCanvas
          level={state.config.level}
          bossHp={state.bossHp}
          lastAttack={state.lastAttack}
          lastMiss={state.lastMiss}
          bossName={state.boss.name}
        />
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-400">약점: {state.boss.weakness}</p>
        </div>
      </div>

      {currentQuestion && (
        <div className="mt-6 rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">
            Question {state.currentQuestionIndex + 1}
          </p>
          <p className="mt-2 text-lg font-bold text-white">{currentQuestion.prompt}</p>
        </div>
      )}
    </div>
  );
};

const AnswerPanel = ({ currentQuestion, hasAnswered, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState('');

  const submit = () => {
    if (selectedOption === null) return;
    const result = onSubmit(selectedOption);
    if (!result.accepted) {
      setFeedback('이미 답을 제출했거나 아직 게임이 시작되지 않았어요.');
      return;
    }
    setFeedback(
      result.correct
        ? '정답입니다. 선생님에게 타격이 들어갔어요.'
        : '아쉽지만 오답이에요. 다시 다음 문제를 노려보세요.'
    );
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6">
      <div className="mb-4 flex items-center gap-3 text-cyan-200">
        <Sparkles size={18} />
        <h3 className="text-xl font-bold">답안 선택</h3>
      </div>
      <div className="grid gap-3">
        {currentQuestion?.options.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={hasAnswered}
            onClick={() => setSelectedOption(index)}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              selectedOption === index
                ? 'border-cyan-300 bg-cyan-400/10'
                : 'border-white/10 bg-slate-950'
            } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'hover:bg-white/5'}`}
          >
            {index + 1}. {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={selectedOption === null || hasAnswered}
        className="mt-4 w-full rounded-2xl bg-cyan-400 px-5 py-4 text-lg font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-cyan-100"
      >
        정답 제출
      </button>
      <p className="mt-3 text-sm text-slate-300">
        {feedback || (hasAnswered ? '이번 문제는 이미 제출했어요. 다음 문제를 기다려보세요.' : '정답을 맞히면 선생님 HP가 줄어듭니다.')}
      </p>
    </div>
  );
};

const StudentRaidScreen = ({ sessionId, raid }) => {
  const { avatars, state, currentQuestion } = raid;
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [playerId, setPlayerId] = useState(() => window.localStorage.getItem(`killteacher-player:${sessionId}`));

  const player = useMemo(
    () => state.students.find((student) => student.id === playerId) || null,
    [playerId, state.students]
  );

  const hasAnswered = Boolean(
    player &&
      currentQuestion &&
      state.responses[currentQuestion.id] &&
      state.responses[currentQuestion.id][player.id] !== undefined
  );

  const joinGame = () => {
    if (!nickname.trim()) return;
    const joined = raid.joinStudent({ name: nickname, avatar: selectedAvatar });
    if (!joined) return;
    window.localStorage.setItem(`killteacher-player:${sessionId}`, joined.id);
    setPlayerId(joined.id);
  };

  const reward = player ? state.rewards.find((item) => item.studentId === player.id) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#9333ea33,transparent_35%),linear-gradient(180deg,#020617,#111827)] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-fuchsia-300">Student Party</p>
            <h1 className="mt-2 text-4xl font-black">레이드 참가 화면</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              닉네임과 캐릭터를 고른 뒤 대기실에 입장하고, 선생님이 시작하면 즉시 같은 게임 화면으로 전환됩니다.
            </p>
          </div>
        </div>

        {!player && state.phase !== 'PLAY' && state.phase !== 'RESULT' && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck size={20} className="text-fuchsia-300" />
                <h2 className="text-2xl font-bold">입장 준비</h2>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">닉네임</span>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="예: 지우"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4"
                />
              </label>
              <div className="mt-5">
                <p className="mb-3 text-sm text-slate-300">이모지 캐릭터 선택</p>
                <div className="grid grid-cols-4 gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`rounded-2xl border px-4 py-4 text-3xl transition ${
                        selectedAvatar === avatar
                          ? 'border-fuchsia-300 bg-fuchsia-400/10'
                          : 'border-white/10 bg-slate-950'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={joinGame}
                className="mt-6 w-full rounded-2xl bg-fuchsia-400 px-5 py-4 text-lg font-black text-slate-950 hover:bg-fuchsia-300"
              >
                대기실 입장
              </button>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-7">
              <div className="mb-5 flex items-center gap-3">
                <Swords size={20} className="text-cyan-300" />
                <h2 className="text-2xl font-bold">오늘의 레이드</h2>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm text-cyan-200">{state.config.classroom || `${state.config.level} ${state.config.grade}학년`}</p>
                <p className="mt-2 text-3xl font-black">{state.config.subject || '선생님이 문제를 준비 중이에요'}</p>
                <p className="mt-2 text-sm text-slate-300">{state.config.topic || '주제 설정 대기 중'}</p>
                <p className="mt-4 text-sm text-slate-300">
                  AI가 만든 문제를 풀어서 선생님의 HP를 깎아보세요. 정답을 맞힐수록 랭킹과 기여도가 실시간으로 반영됩니다.
                </p>
                <div className="mt-6 text-8xl text-center">{state.boss.avatar}</div>
              </div>
            </div>
          </div>
        )}

        {player && state.phase === 'LOBBY' && (
          <div className="rounded-[36px] border border-white/10 bg-slate-900/80 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-fuchsia-400/10 text-6xl">
              {player.avatar}
            </div>
            <h2 className="mt-6 text-4xl font-black">{player.name} 학생, 대기 완료</h2>
            <p className="mt-3 text-lg text-slate-300">
              선생님이 레이드를 시작하면 이 화면이 자동으로 게임 화면으로 전환됩니다.
            </p>
          </div>
        )}

        {state.phase === 'PLAY' && (
          <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
            <PlayerArena raid={raid} currentQuestion={currentQuestion} player={player} />

            <div className="space-y-6">
              {player ? (
                <AnswerPanel
                  key={currentQuestion?.id || state.phase}
                  currentQuestion={currentQuestion}
                  hasAnswered={hasAnswered}
                  onSubmit={(selectedOption) =>
                    raid.submitAnswer({ studentId: player.id, optionIndex: selectedOption })
                  }
                />
              ) : (
                <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 text-center">
                  <p className="text-lg font-bold text-fuchsia-200">관전 모드</p>
                  <p className="mt-2 text-sm text-slate-300">게임이 진행 중입니다. 실시간 랭킹을 확인하세요.</p>
                </div>
              )}

              <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6">
                <div className="mb-4 flex items-center gap-3 text-amber-200">
                  <Crown size={18} />
                  <h3 className="text-xl font-bold">실시간 랭킹</h3>
                </div>
                <div className="space-y-3">
                  {state.rankings.map((student, index) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                        player && student.id === player.id
                          ? 'border-fuchsia-300/40 bg-fuchsia-400/10'
                          : 'border-white/5 bg-slate-950/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-amber-300">#{index + 1}</span>
                        <span className="text-2xl">{student.avatar}</span>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-xs text-slate-400">데미지 {student.totalDamage}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-300">정답 {student.correctCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {state.phase === 'RESULT' && (
          <div className="rounded-[36px] border border-amber-300/20 bg-[linear-gradient(180deg,rgba(232,121,249,0.16),rgba(15,23,42,0.95))] p-8">
            <div className="text-center">
              <Trophy className="mx-auto text-amber-300" size={64} />
              <h2 className="mt-5 text-5xl font-black">
                {state.bossHp <= 0 ? '선생님 처치 성공!' : '선생님이 살아남았다!'}
              </h2>
              <p className="mt-3 text-lg text-slate-200">
                {state.bossHp <= 0
                  ? '팀 기여도가 집계되었고, 당신의 칭호와 뱃지가 생성되었습니다.'
                  : '아쉽지만 선생님을 쓰러뜨리지 못했어요. 그래도 당신의 기여를 확인해보세요.'}
              </p>
            </div>

            <div className={`mt-8 grid gap-4 ${player ? 'lg:grid-cols-[0.9fr_1.1fr]' : ''}`}>
              {player && (
                <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 text-center">
                  <div className="text-7xl">{player.avatar}</div>
                  <p className="mt-4 text-3xl font-black">{player.name}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    총 데미지 {player.totalDamage} · 정답 {player.correctCount}개 · 정확도 {player.accuracy}%
                  </p>
                  <div className="mt-6 rounded-3xl bg-amber-400/10 p-5">
                    <p className="text-2xl font-black text-amber-200">
                      {reward?.badge || '🏅'} {reward?.title || '팀 전사'}
                    </p>
                    <p className="mt-2 text-sm text-slate-200">{reward?.summary}</p>
                  </div>
                </div>
              )}

              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6">
                <h3 className="text-xl font-bold">최종 랭킹</h3>
                <div className="mt-5 space-y-3">
                  {state.rankings.map((student, index) => {
                    const rankingReward = state.rewards.find((item) => item.studentId === student.id);
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/80 px-4 py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-amber-300">#{index + 1}</span>
                          <span className="text-2xl">{student.avatar}</span>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-xs text-slate-400">
                              {rankingReward?.badge || '🏅'} {rankingReward?.title || '팀 전사'}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-200">{student.totalDamage} dmg</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRaidScreen;
