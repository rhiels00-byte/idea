import React from 'react';
import MindLogWidget from './MindLogWidget';

const TOOLS = [
  {
    id: 1,
    title: '성적 관리 시스템',
    description: '학생들의 성적과 평가 데이터를 한눈에 확인하고 분석하세요.',
    icon: '📊',
  },
  {
    id: 2,
    title: '스마트 출석부',
    description: 'QR코드 및 얼굴인식을 통한 간편하고 빠른 스마트 출석 체크.',
    icon: '✅',
  },
  {
    id: 3,
    title: '디지털 수업 자료실',
    description: '수업에 필요한 다양한 멀티미디어 교보재를 손쉽게 공유합니다.',
    icon: '📁',
  },
  {
    id: 4,
    title: '학부모 소통 채널',
    description: '학부모님들과 쉽고 안전하게 소통할 수 있는 통합 알림장.',
    icon: '💬',
  },
  {
    id: 5,
    title: '마음 로그',
    description: '선생님의 마음을 기록합니다. 그리고 위로해드립니다.',
    icon: '💖',
    link: '/mindlog',
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

const App = () => {
  const path = window.location.pathname;
  if (path.startsWith('/mindlog')) return <MindLogPage />;
  return <Landing />;
};

export default App;
