import React, { useMemo, useState } from 'react';
import { QrCode, Sword, Trophy, Users, Zap } from 'lucide-react';

const buildQuestions = (subject, count) => {
  const base = subject?.trim() || '일반 상식';
  return Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    title: `${base} 미션 ${idx + 1}`,
    prompt: `${base} 관련 문제 ${idx + 1}번. 가장 알맞은 답을 고르세요.`,
    options: ['A', 'B', 'C', 'D'].map((opt) => `${opt} 보기`),
    answerIndex: idx % 4,
  }));
};

const BeatTheTeacher = () => {
  const [viewMode, setViewMode] = useState('TEACHER'); // TEACHER | STUDENT
  const [step, setStep] = useState('SETUP'); // SETUP | PREVIEW | LOBBY | PLAY | RESULT
  const [config, setConfig] = useState({
    level: '초등',
    grade: '',
    subject: '',
    qCount: 5,
  });
  const [bossHp, setBossHp] = useState(100);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lastHit, setLastHit] = useState(null);
  const [logs, setLogs] = useState([
    { id: 1, name: '김철수', damage: 10, time: '방금 전' },
    { id: 2, name: '이영희', damage: 15, time: '1초 전' },
  ]);

  const questions = useMemo(
    () => buildQuestions(config.subject, Number(config.qCount) || 5),
    [config.subject, config.qCount]
  );

  const currentQuestion = questions[questionIndex];

  const startSession = () => {
    if (!config.grade || !config.subject) return;
    setStep('PREVIEW');
  };

  const openLobby = () => setStep('LOBBY');
  const startPlay = () => setStep('PLAY');

  const registerHit = (damage) => {
    setBossHp((prev) => Math.max(0, prev - damage));
    setLogs((prev) => [
      {
        id: Date.now(),
        name: '학생',
        damage,
        time: '방금 전',
      },
      ...prev,
    ]);
    setLastHit(damage);
  };

  const handleStudentSubmit = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuestion.answerIndex;
    if (isCorrect) {
      registerHit(12);
    }
    setSelectedOption(null);
    const next = questionIndex + 1;
    if (next >= questions.length || bossHp - (isCorrect ? 12 : 0) <= 0) {
      setStep('RESULT');
      return;
    }
    setQuestionIndex(next);
  };

  const reset = () => {
    setStep('SETUP');
    setBossHp(100);
    setQuestionIndex(0);
    setSelectedOption(null);
    setLastHit(null);
    setLogs([
      { id: 1, name: '김철수', damage: 10, time: '방금 전' },
      { id: 2, name: '이영희', damage: 15, time: '1초 전' },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Beat the Teacher</p>
            <h1 className="text-3xl font-black">교사를 이겨라</h1>
            <p className="mt-2 text-sm text-slate-400">
              교사/학생 화면을 전환하며 보스 레이드 수업 흐름을 미리 확인하세요.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-900 p-1">
            <button
              onClick={() => setViewMode('TEACHER')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
                viewMode === 'TEACHER' ? 'bg-indigo-500 text-white' : 'text-slate-400'
              }`}
            >
              교사 화면
            </button>
            <button
              onClick={() => setViewMode('STUDENT')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
                viewMode === 'STUDENT' ? 'bg-indigo-500 text-white' : 'text-slate-400'
              }`}
            >
              학생 화면
            </button>
          </div>
        </div>

        {step === 'SETUP' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">퀵 셋업</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 ml-2">학교급</label>
                  <select
                    className="mt-1 w-full rounded-xl border-none bg-slate-800 p-4 focus:ring-2 focus:ring-indigo-500"
                    value={config.level}
                    onChange={(e) => setConfig({ ...config, level: e.target.value })}
                  >
                    {['초등', '중등', '고등'].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 ml-2">학년</label>
                  <input
                    className="mt-1 w-full rounded-xl border-none bg-slate-800 p-4 focus:ring-2 focus:ring-indigo-500"
                    placeholder="3"
                    value={config.grade}
                    onChange={(e) => setConfig({ ...config, grade: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 ml-2">진행 과목</label>
                  <input
                    className="mt-1 w-full rounded-xl border-none bg-slate-800 p-4 focus:ring-2 focus:ring-indigo-500"
                    placeholder="예: 중학 과학 (광합성)"
                    value={config.subject}
                    onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 ml-2">문항 수</label>
                  <select
                    className="mt-1 w-full rounded-xl border-none bg-slate-800 p-4 focus:ring-2 focus:ring-indigo-500"
                    value={config.qCount}
                    onChange={(e) => setConfig({ ...config, qCount: e.target.value })}
                  >
                    {[5, 8, 10, 15].map((count) => (
                      <option key={count} value={count}>
                        {count}문항
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={startSession}
                  className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
                >
                  퀴즈 생성 & 미리보기
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-indigo-500/30 bg-indigo-900/20 p-8">
              <h3 className="text-xl font-bold mb-3">AI 던전 생성 요약</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li>선택 과목 기반 보스 테마 자동 생성</li>
                <li>문항 수만큼 퀴즈 자동 큐레이션</li>
                <li>실시간 대시보드 자동 활성화</li>
              </ul>
              <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950">
                <video
                  className="h-48 w-full object-cover"
                  src={
                    config.level === '초등'
                      ? '/videos/elementary.mp4'
                      : config.level === '중등'
                      ? '/videos/middle.mp4'
                      : '/videos/high.mp4'
                  }
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-5">
                <p className="text-xs uppercase tracking-widest text-indigo-300">미리보기</p>
                <p className="mt-2 text-lg font-bold">{config.subject || '과목을 입력하세요'}</p>
                <p className="text-sm text-slate-400">
                  {config.level} {config.grade ? `${config.grade}학년` : '학년 입력'}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'PREVIEW' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <h2 className="text-xl font-bold mb-4">문항 미리보기</h2>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-indigo-300">Q{q.id}</p>
                    <p className="text-sm font-semibold mt-1">{q.prompt}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                      {q.options.map((opt, idx) => (
                        <span key={opt}>
                          {idx + 1}. {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-indigo-500/30 bg-indigo-900/20 p-8">
              <h3 className="text-lg font-bold mb-2">세션 요약</h3>
              <p className="text-sm text-slate-400">
                {config.level} {config.grade ? `${config.grade}학년` : '학년 입력'}
              </p>
              <p className="text-sm text-slate-400">{config.subject}</p>
              <p className="text-sm text-slate-400">총 {config.qCount}문항</p>
              <button
                onClick={openLobby}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
              >
                학생 모집 시작
              </button>
              <button
                onClick={reset}
                className="mt-3 w-full text-xs text-slate-400 underline underline-offset-4"
              >
                다시 설정하기
              </button>
            </div>
          </div>
        )}

        {step === 'LOBBY' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <h2 className="text-xl font-bold mb-4">QR 코드로 모여주세요</h2>
              <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-indigo-500/40 bg-slate-950 p-10">
                <QrCode size={120} className="text-indigo-400" />
                <div className="text-center">
                  <p className="text-lg font-bold">JOIN CODE</p>
                  <p className="text-3xl font-black text-indigo-400">BOSS-0924</p>
                  <p className="text-sm text-slate-400 mt-2">학생들이 QR을 스캔하면 자동 입장합니다.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-indigo-500/30 bg-indigo-900/20 p-8">
              <h3 className="text-lg font-bold mb-3">참여 현황</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>접속 학생: 18명</p>
                <p>대기 중: 6명</p>
                <p>준비 완료: 12명</p>
              </div>
              <button
                onClick={startPlay}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
              >
                게임 시작
              </button>
            </div>
          </div>
        )}

        {step === 'PLAY' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={120} />
                </div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">
                      BOSS: {config.subject}
                    </h2>
                    <p className="text-slate-500 font-bold">
                      {config.level} {config.grade ? `${config.grade}학년` : ''}의 총공격 진행 중
                    </p>
                  </div>
                  <span className="text-4xl font-black text-red-500">{bossHp}%</span>
                </div>
                <div className="h-8 w-full overflow-hidden rounded-full bg-slate-800 border-4 border-slate-800">
                  <div
                    className={`h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-500 ${
                      lastHit ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Sword size={32} className="text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">몬스터를 쓰러트리는 중</p>
                    <p className="text-xs text-slate-400">정답이 쌓일수록 HP가 감소합니다.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <Users size={16} /> LIVE ATTACK LOG
                </h3>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-white/5"
                    >
                      <span className="font-bold text-indigo-300">{log.name} 학생의 정답!</span>
                      <span className="text-red-400 font-black">-{log.damage} HP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/30 bg-indigo-900/20 p-8">
              {viewMode === 'TEACHER' ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">교사 제어판</h3>
                  <div className="rounded-2xl bg-slate-900/60 p-4 text-sm text-slate-300">
                    현재 문항: {questionIndex + 1} / {questions.length}
                  </div>
                  <button
                    onClick={() => registerHit(8)}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
                  >
                    수동 타격 테스트
                  </button>
                  <button
                    onClick={reset}
                    className="w-full text-xs text-slate-400 underline underline-offset-4"
                  >
                    세션 종료
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">학생 퀴즈</h3>
                  <div className="rounded-2xl bg-slate-900/60 p-4 text-sm text-slate-300">
                    <p className="text-xs text-indigo-300">Q{currentQuestion.id}</p>
                    <p className="mt-1 font-semibold">{currentQuestion.prompt}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`rounded-xl border px-3 py-2 text-xs transition-all ${
                          selectedOption === idx
                            ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                            : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleStudentSubmit}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500"
                  >
                    정답 제출
                  </button>
                  <p className="text-xs text-slate-400">
                    정답 시 보스 HP가 줄어드는 장면이 함께 표시됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'RESULT' && (
          <div className="rounded-3xl border border-indigo-500/30 bg-slate-900 p-12 text-center shadow-2xl">
            <Trophy size={96} className="mx-auto text-yellow-500 mb-6" />
            <h2 className="text-4xl font-black mb-3">VICTORY!</h2>
            <p className="text-lg text-indigo-300">
              {config.level} {config.grade ? `${config.grade}학년` : ''} 전사들이 보스를 물리쳤습니다!
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-800 p-6">
                <p className="text-xs text-slate-500 uppercase">Top Damager</p>
                <p className="text-xl font-bold">김철수</p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-6">
                <p className="text-xs text-slate-500 uppercase">Combo King</p>
                <p className="text-xl font-bold">이서윤</p>
              </div>
              <div className="rounded-2xl bg-slate-800 p-6">
                <p className="text-xs text-slate-500 uppercase">Final Hit</p>
                <p className="text-xl font-bold">박민준</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-8 rounded-xl bg-white px-12 py-4 font-black text-black transition-colors hover:bg-indigo-400"
            >
              로비로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeatTheTeacher;
