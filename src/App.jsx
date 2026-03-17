import React from 'react';
import MindLogWidget from './MindLogWidget';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Teacher Care</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Mind-Log</h1>
          <p className="text-sm text-slate-400">
            오늘 하루, 교사의 마음을 위한 작은 기록.
          </p>
        </div>

        <a
          href="/mindlog"
          target="_blank"
          rel="noreferrer"
          className="group w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-indigo-400">Mind-Log 카드</h2>
            <span className="text-xs text-slate-500">새 창 열기</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            오늘 있었던 일을 적고, 나에게 맞는 처방을 골라보세요.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-300">
            카드 열기
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </a>
      </div>
    </div>
  );
};

const MindLogPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <MindLogWidget />
    </div>
  );
};

const App = () => {
  const path = window.location.pathname;
  if (path.startsWith('/mindlog')) return <MindLogPage />;
  return <Landing />;
};

export default App;
