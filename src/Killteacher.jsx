import React, { useEffect, useState } from 'react';
import { Sword, Users, Trophy, Zap } from 'lucide-react';

const BeatTheTeacher = () => {
  // 시스템 상태: 'SETUP' | 'PLAY' | 'RESULT'
  const [status, setStatus] = useState('SETUP');
  const [config, setConfig] = useState({ class: '', subject: '', qCount: 10 });
  const [bossHp, setBossHp] = useState(100);

  // 가상의 실시간 데이터 (학생들의 공격 로그)
  const [logs, setLogs] = useState([
    { id: 1, name: '김철수', damage: 10, time: '방금 전' },
    { id: 2, name: '이영희', damage: 15, time: '1초 전' },
  ]);

  useEffect(() => {
    if (bossHp <= 0 && status === 'PLAY') {
      setStatus('RESULT');
    }
  }, [bossHp, status]);

  const handleStart = () => {
    if (config.class && config.subject) setStatus('PLAY');
  };

  const handleAttack = () => {
    const damage = Math.floor(Math.random() * 10) + 5;
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
  };

  // --- 1. 교사 설정 화면 (SETUP) ---
  if (status === 'SETUP') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Sword size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">보스 레이드 생성</h1>
          <p className="text-slate-400 text-center text-sm mb-8">학급 정보를 입력하여 던전을 엽니다.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 ml-2">대상 학급</label>
              <input
                className="w-full bg-slate-800 border-none rounded-xl p-4 mt-1 focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="예: 3학년 2반"
                onChange={(e) => setConfig({ ...config, class: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 ml-2">진행 과목</label>
              <input
                className="w-full bg-slate-800 border-none rounded-xl p-4 mt-1 focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="예: 중학 과학 (광합성)"
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              />
            </div>
            <button
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all mt-4"
            >
              게임 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. 게임 진행 화면 (PLAY) ---
  if (status === 'PLAY') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 보스 모니터링 (교사 화면 핵심) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={120} />
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-tighter">
                    BOSS: {config.subject}
                  </h2>
                  <p className="text-slate-500 font-bold">{config.class}의 총공격 진행 중</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-red-500">{bossHp}%</span>
                </div>
              </div>
              {/* HP Bar */}
              <div className="w-full bg-slate-800 h-8 rounded-full border-4 border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  style={{ width: `${bossHp}%` }}
                />
              </div>
            </div>

            {/* 실시간 공격 로그 */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
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

          {/* 오른쪽: 학생용 공격 패널 (시뮬레이션) */}
          <div className="bg-indigo-900/20 rounded-3xl p-8 border border-indigo-500/30 flex flex-col justify-center text-center">
            <h3 className="text-xl font-bold mb-6 italic">"공격 버튼을 눌러보세요"</h3>
            <button
              onClick={handleAttack}
              className="group relative w-40 h-40 mx-auto bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              <Sword size={60} className="group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 group-hover:animate-ping"></div>
            </button>
            <p className="mt-8 text-sm text-indigo-300 opacity-60">
              학생 기기에서는 퀴즈를 맞히면 <br />
              자동으로 공격이 나갑니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. 결과 화면 (RESULT) ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/50 rounded-[40px] p-12 text-center shadow-[0_0_100px_rgba(79,70,229,0.2)]">
        <Trophy
          size={100}
          className="mx-auto text-yellow-500 mb-8 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]"
        />
        <h1 className="text-5xl font-black mb-4">VICTORY!</h1>
        <p className="text-xl text-indigo-300 mb-12">{config.class} 전사들이 보스를 물리쳤습니다!</p>

        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800 p-6 rounded-3xl border border-white/5">
            <p className="text-xs text-slate-500 mb-2 uppercase">Best Damager</p>
            <p className="text-xl font-bold">김철수</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-3xl border border-white/5">
            <p className="text-xs text-slate-500 mb-2 uppercase">Combo King</p>
            <p className="text-xl font-bold">이서윤</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-3xl border border-white/5">
            <p className="text-xs text-slate-500 mb-2 uppercase">Final Hit</p>
            <p className="text-xl font-bold">박민준</p>
          </div>
        </div>

        <button
          onClick={() => {
            setStatus('SETUP');
            setBossHp(100);
          }}
          className="px-12 py-4 bg-white text-black rounded-2xl font-black hover:bg-indigo-400 transition-colors"
        >
          로비로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default BeatTheTeacher;
