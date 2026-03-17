import React, { useEffect, useRef, useState } from 'react';
import { Moon, Smile, Frown, Play, RefreshCcw } from 'lucide-react';

const BAD_WORDS = ['학부모', '민원', '소송', '힘들다', '때려치', '짜증', '말 안 들어'];

const MindLogWidget = () => {
  const [entry, setEntry] = useState('');
  const [stressLevel, setStressLevel] = useState(0);
  const [prescription, setPrescription] = useState(null);
  const [step, setStep] = useState('input'); // 'input' | 'analysis' | 'result' | 'history'
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);

  const isAnalyzing = step === 'analysis';
  const isDisabled = isAnalyzing || entry.trim().length === 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 스트레스 분석 시뮬레이션 로직
  const analyzeStress = () => {
    if (isDisabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setStep('analysis');
    setPrescription(null);

    // 키워드 기반 단순 로직 (실제 서비스에선 AI API 연동)
    let score = 30; // 기본 스트레스
    BAD_WORDS.forEach((word) => {
      if (entry.includes(word)) score += 15;
    });

    timerRef.current = setTimeout(() => {
      const capped = Math.min(score, 100);
      setStressLevel(capped);
      generatePrescription(capped);
      setHistory((prev) => [
        {
          id: Date.now(),
          text: entry.trim(),
          stress: capped,
          createdAt: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      setStep('result');
    }, 1500);
  };

  const PRESCRIPTIONS = {
    피식: {
      type: '피식',
      title: '피식 처방',
      description: '자존심 상하는 개그 한줄 보고 마음 풀기',
      msg: '질문: 세상에서 가장 가난한 왕은?\n정답: 최저임금',
      url: null,
    },
    냥냥: {
      type: '냥냥',
      title: '냥냥 처방',
      description: '힐링되는 강아지, 고양이 영상보고 마음 녹히기',
      msg: '지금은 말보다 영상이 약이죠. 1분만 숨 고르기.',
      url: 'https://example.com/cat-video',
    },
    맞아: {
      type: '맞아',
      title: '맞아 처방',
      description: '같이 욕해주는 공감 봇의 멘트 보고 힘내기',
      msg: '맞아, 그 상황 진짜 열받아. 네가 이상한 게 아니야.',
      url: null,
    },
  };

  const generatePrescription = (score) => {
    setPrescription(score > 70 ? PRESCRIPTIONS.냥냥 : PRESCRIPTIONS.피식);
  };

  const selectPrescription = (type) => {
    setPrescription(PRESCRIPTIONS[type] || PRESCRIPTIONS.피식);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setEntry('');
    setStressLevel(0);
    setPrescription(null);
    setStep('input');
  };

  return (
    <div className="flex w-full max-w-md flex-col rounded-3xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-indigo-400">
          <Moon size={24} /> Mind-Log
        </h2>
        <span className="text-xs text-slate-500">2026.03.17 퇴근 모드</span>
      </div>

      {step === 'input' && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-400">
            오늘 학교에서 있었던 일, <br />
            누구한테도 말 못 할 속마음을 털어놓으세요.
          </p>
          <textarea
            className="h-32 w-full resize-none rounded-2xl border-none bg-slate-800 p-4 text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="예: 오늘 5교시에 애들이 너무 떠들어서 현타 왔어..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <button
            onClick={analyzeStress}
            disabled={isDisabled}
            className={`w-full rounded-xl py-3 font-semibold shadow-lg transition-all ${
              isDisabled
                ? 'cursor-not-allowed bg-indigo-600/40 text-indigo-200'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            마음 분석 시작
          </button>
        </div>
      )}

      {step === 'analysis' && (
        <div className="flex flex-col items-center space-y-4 py-12">
          <div className="animate-spin text-indigo-400">
            <RefreshCcw size={40} />
          </div>
          <p className="animate-pulse">Lisa님의 마음 결을 읽는 중...</p>
        </div>
      )}

      {step === 'result' && prescription && (
        <div className="space-y-6 text-center">
          {/* 3D Emoji Placeholder */}
          <div className="flex justify-center py-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              {stressLevel > 60 ? <Frown size={50} /> : <Smile size={50} />}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-400">스트레스 지수: {stressLevel}%</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${
                  stressLevel > 60 ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${stressLevel}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-900/50 bg-slate-800 p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
              오늘의 처방
            </p>
            <h3 className="mb-2 text-lg font-bold">{prescription.title}</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {prescription.msg}
            </p>
            {prescription.type === '냥냥' && (
              <button
                className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-indigo-500/20 px-4 py-2 text-indigo-400 transition-all hover:bg-indigo-500/30"
                type="button"
              >
                <Play size={16} /> 영상 재생하기
              </button>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              원하는 처방 선택
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => selectPrescription('피식')}
                title={PRESCRIPTIONS.피식.description}
                className={`rounded-lg px-3 py-2 text-sm transition-all ${
                  prescription.type === '피식'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                피식
              </button>
              <button
                type="button"
                onClick={() => selectPrescription('냥냥')}
                title={PRESCRIPTIONS.냥냥.description}
                className={`rounded-lg px-3 py-2 text-sm transition-all ${
                  prescription.type === '냥냥'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                냥냥
              </button>
              <button
                type="button"
                onClick={() => selectPrescription('맞아')}
                title={PRESCRIPTIONS.맞아.description}
                className={`rounded-lg px-3 py-2 text-sm transition-all ${
                  prescription.type === '맞아'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                맞아
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs">
            <button
              onClick={reset}
              className="text-slate-500 underline underline-offset-4 hover:text-slate-300"
            >
              다시 기록하기
            </button>
            <button
              onClick={() => setStep('history')}
              className="text-slate-500 underline underline-offset-4 hover:text-slate-300"
            >
              기록 내역보기
            </button>
          </div>
        </div>
      )}

      {step === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">기록 내역</h3>
            <button
              onClick={reset}
              className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-300"
            >
              다시 기록하기
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">아직 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.createdAt}</span>
                    <span>스트레스 {item.stress}%</span>
                  </div>
                  <p className="whitespace-pre-line text-sm text-slate-200">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MindLogWidget;
