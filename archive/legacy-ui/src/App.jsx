import React from 'react';
import MindLogWidget from './MindLogWidget';
import Killteacher from './Killteacher';

const TOOLS = [
  {
    id: 1,
    title: '마음 로그',
    description: '마음을 기록하고 행복을 찾으세요.',
    icon: '💖',
    link: '/mindlog',
  },
  {
    id: 2,
    title: '선생님을 쓰러트려라',
    description: '친구들아 힘을 합쳐서 문제를 풀거라',
    icon: '⚔️',
    link: '/killteacher',
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16 text-gray-800">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">
            교사 지원 통합 게이트웨이
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            수업 준비부터 학생 관리, 학부모 소통까지.
            <br />
            선생님의 업무 부담을 줄여주는 다양한 스마트 교육 서비스들을 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => {
            const isLink = Boolean(tool.link);
            const Comp = isLink ? 'a' : 'div';
            return (
              <Comp
                key={tool.id}
                href={tool.link || undefined}
                target={isLink ? '_blank' : undefined}
                rel={isLink ? 'noreferrer' : undefined}
                className="flex cursor-pointer flex-col items-center rounded-xl border border-gray-100 bg-white p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-4 text-5xl">{tool.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-indigo-600">{tool.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{tool.description}</p>
              </Comp>
            );
          })}
        </div>
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

const KillteacherPage = () => {
  return <Killteacher />;
};

const App = () => {
  const path = window.location.pathname;
  if (path.startsWith('/mindlog')) return <MindLogPage />;
  if (path.startsWith('/killteacher')) return <KillteacherPage />;
  return <Landing />;
};

export default App;
