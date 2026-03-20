import { useState } from 'react';
import { Sun, Smile, Frown, Meh, RefreshCcw } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyDvQdTWJuz2iupvii2X7UIruBVhiqU7Yg0';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Gemini API 호출
const callGemini = async (prompt) => {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 300 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// 큐레이션된 힐링 YouTube Shorts 목록
const HEALING_SHORTS = [
  { videoId: 'dLyOSwMBl8E', title: '아기 고양이 힐링 모음' },
  { videoId: 'J---aiyznGQ', title: '키보드 캣' },
  { videoId: 'VB3OTlCBxSA', title: '귀여운 고양이 모음' },
  { videoId: 'hY7m5jjJ9mM', title: '귀여운 강아지 모음' },
  { videoId: 'SB-qEYVdkmA', title: '아기 고양이의 하루' },
  { videoId: 'tntOCGkgt98', title: '웃긴 강아지 리액션' },
  { videoId: 'XqZsoesa55w', title: '아기 판다 귀여운 순간' },
  { videoId: 'SMWi7CLoZ2Q', title: '힐링 고양이 골골송' },
];

const pickRandomShort = () => HEALING_SHORTS[Math.floor(Math.random() * HEALING_SHORTS.length)];

// ── 스트레스 분석 (Gemini) ──
const analyzeStressWithAI = async (text) => {
  const prompt = `당신은 심리 분석 전문가입니다. 아래 텍스트의 부정적 감정 수준을 분석해주세요.

텍스트: "${text}"

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{"score": 정수, "level": "레벨명", "emoji": "이모지1개", "comment": "한줄 코멘트"}

■ 스트레스 지수 판단 기준 (반드시 준수):

【81~100점: 극심한 스트레스】
- 죽고 싶다, 자살, 죽어버릴까, 죽음, 끝내고 싶다, 사라지고 싶다 등 죽음·자해와 관련된 표현 → 무조건 90~100점
- 퇴사하고 싶다, 때려치우고 싶다, 그만두고 싶다, 관두고 싶다 등 퇴사·포기 관련 표현 → 81~92점
- 죽음에 가까운 표현일수록 100에 가깝게, 퇴사 표현은 81~92 사이
- level: "극심한 스트레스"

【61~80점: 높은 스트레스】
- 짜증난다, 힘들다, 미치겠다, 지친다, 열받아, 빡친다, 돌아버리겠다, 현타 등 직접적 감정 폭발 표현
- 힘들다/지친다에 가까운 표현일수록 80에 가깝게
- 짜증/열받음 표현은 61~70 사이
- level: "높은 스트레스"

【21~60점: 스트레스】
- 구체적 상황 설명 + 감정이 섞인 경우 (예: "오늘 회의에서 팀장이 내 의견을 무시해서 기분이 안 좋았다")
- 부정적이고 격한 표현일수록 60에 가깝게, 담담한 서술이면 21~35 사이
- level: 21~40이면 "약간 지침", 41~60이면 "스트레스"

【0~20점: 평온】
- 일상적이고 긍정적인 내용, 부정 표현이 거의 없음
- level: "평온"

중요: 죽음/자살 관련 표현이 포함되면 반드시 90점 이상을 부여하세요. 퇴사/포기 표현은 반드시 81점 이상입니다.`;

  const raw = await callGemini(prompt);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fallback
  }
  return { score: 50, level: '스트레스', emoji: '😥', comment: '마음이 힘드시군요.' };
};

// ── 피식 개그 생성 ──
const generateJoke = async () => {
  const prompt = `한국 직장인/선생님이 퇴근 후 피식 웃을 수 있는 아재개그나 짧은 유머를 하나만 만들어주세요.
형식: "질문: ...\n정답: ..." 또는 짧은 유머 한 문단. 3줄 이내로 짧게.`;
  return await callGemini(prompt);
};

// ── 맞아 공감 문장 생성 ──
const generateEmpathy = async (userText) => {
  const prompt = `사용자가 힘든 하루를 보냈습니다. 아래 내용을 읽고, 친한 친구처럼 진심으로 공감해주세요.
반말로, 따뜻하지만 시원하게. "맞아"로 시작해주세요. 3~4문장.

사용자 이야기: "${userText}"`;
  return await callGemini(prompt);
};

// 스트레스 색상
const getStressColor = (score) => {
  if (score <= 20) return { bar: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (score <= 40) return { bar: 'bg-lime-400', text: 'text-lime-600', bg: 'bg-lime-50' };
  if (score <= 60) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' };
  if (score <= 80) return { bar: 'bg-orange-400', text: 'text-orange-600', bg: 'bg-orange-50' };
  return { bar: 'bg-rose-400', text: 'text-rose-600', bg: 'bg-rose-50' };
};

const getStressIcon = (score) => {
  if (score <= 30) return <Smile size={50} className="text-emerald-500" />;
  if (score <= 60) return <Meh size={50} className="text-amber-500" />;
  return <Frown size={50} className="text-rose-400" />;
};

const MindLogWidget = () => {
  const [entry, setEntry] = useState('');
  const [stressLevel, setStressLevel] = useState(0);
  const [stressInfo, setStressInfo] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [step, setStep] = useState('input'); // 'input' | 'analysis' | 'result' | 'history'
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDisabled = step === 'analysis' || entry.trim().length === 0;

  // 스트레스 분석
  const analyzeStress = async () => {
    if (isDisabled) return;
    setStep('analysis');
    setPrescription(null);
    setStressInfo(null);

    try {
      const result = await analyzeStressWithAI(entry);
      const score = Math.max(0, Math.min(100, result.score));
      setStressLevel(score);
      setStressInfo(result);

      // 자동 처방 로드
      await loadPrescription(score > 70 ? '냥냥' : score > 40 ? '맞아' : '피식');

      setHistory((prev) => [
        { id: Date.now(), text: entry.trim(), stress: score, level: result.level, createdAt: new Date().toLocaleString() },
        ...prev,
      ]);
      setStep('result');
    } catch (err) {
      console.error('분석 오류:', err);
      setStressLevel(50);
      setStressInfo({ score: 50, level: '스트레스', emoji: '😥', comment: '분석 중 오류가 발생했어요.' });
      setPrescription({ type: '피식', content: '질문: 세상에서 가장 가난한 왕은?\n정답: 최저임금', video: null });
      setStep('result');
    }
  };

  // 처방 콘텐츠 로드 (카드 안에 바로 표시)
  const loadPrescription = async (type) => {
    setLoading(true);
    setPrescription({ type, content: null, video: null });

    try {
      if (type === '피식') {
        const joke = await generateJoke();
        setPrescription({ type, content: joke, video: null });
      } else if (type === '냥냥') {
        const video = pickRandomShort();
        setPrescription({ type, content: null, video });
      } else if (type === '맞아') {
        const msg = await generateEmpathy(entry);
        setPrescription({ type, content: msg, video: null });
      }
    } catch (err) {
      console.error('처방 오류:', err);
      setPrescription({ type, content: '처방을 불러오지 못했어요. 다시 시도해주세요.', video: null });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setEntry('');
    setStressLevel(0);
    setStressInfo(null);
    setPrescription(null);
    setStep('input');
    setLoading(false);
  };

  const stressColors = getStressColor(stressLevel);

  return (
    <div className="flex w-full max-w-md flex-col rounded-3xl border border-stone-200 bg-gradient-to-b from-amber-50 via-white to-emerald-50 p-6 font-sans text-stone-700 shadow-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-teal-600">
          <Sun size={24} className="text-amber-400" /> Mind-Log
        </h2>
        <span className="text-xs text-stone-400">오늘의 마음 돌봄</span>
      </div>

      {/* ── 입력 ── */}
      {step === 'input' && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-500">
            오늘 학교에서 있었던 일, <br />
            누구한테도 말 못 할 속마음을 털어놓으세요.
          </p>
          <textarea
            className="h-32 w-full resize-none rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700 placeholder-stone-300 shadow-inner focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200"
            placeholder="예: 오늘 5교시에 애들이 너무 떠들어서 현타 왔어..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <button
            onClick={analyzeStress}
            disabled={isDisabled}
            className={`w-full rounded-xl py-3 font-semibold shadow-md transition-all ${
              isDisabled
                ? 'cursor-not-allowed bg-teal-200 text-teal-400'
                : 'bg-teal-500 text-white hover:bg-teal-400 hover:shadow-lg'
            }`}
          >
            마음 분석 시작
          </button>
        </div>
      )}

      {/* ── 분석 중 ── */}
      {step === 'analysis' && (
        <div className="flex flex-col items-center space-y-4 py-12">
          <div className="animate-spin text-teal-400">
            <RefreshCcw size={40} />
          </div>
          <p className="animate-pulse text-stone-500">마음 결을 읽는 중...</p>
        </div>
      )}

      {/* ── 결과 ── */}
      {step === 'result' && (
        <div className="space-y-6 text-center">
          {/* 이모지 */}
          <div className="flex justify-center py-4">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full ${stressColors.bg} shadow-lg`}>
              {getStressIcon(stressLevel)}
            </div>
          </div>

          {/* 스트레스 지수 */}
          <div className="space-y-2">
            {stressInfo && (
              <p className={`text-sm font-semibold ${stressColors.text}`}>
                {stressInfo.emoji} {stressInfo.level} — {stressInfo.comment}
              </p>
            )}
            <p className="text-xs text-stone-400">스트레스 지수: {stressLevel}%</p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${stressColors.bar}`}
                style={{ width: `${stressLevel}%` }}
              />
            </div>
          </div>

          {/* 처방 카드 — 콘텐츠 바로 표시 */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-500">
              오늘의 처방
            </p>

            {loading ? (
              <div className="flex flex-col items-center space-y-3 py-6">
                <div className="animate-spin text-teal-400"><RefreshCcw size={24} /></div>
                <p className="animate-pulse text-sm text-stone-400">처방 준비 중...</p>
              </div>
            ) : prescription ? (
              <>
                {/* 피식 / 맞아: 텍스트 콘텐츠 */}
                {prescription.content && (
                  <p className="whitespace-pre-line rounded-xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
                    {prescription.content}
                  </p>
                )}

                {/* 냥냥: YouTube Shorts 임베딩 */}
                {prescription.type === '냥냥' && prescription.video && (
                  <div className="space-y-3">
                    <div className="mx-auto overflow-hidden rounded-xl shadow-md" style={{ maxWidth: '280px', aspectRatio: '9/16' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${prescription.video.videoId}?autoplay=0&loop=1`}
                        title={prescription.video.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-xs text-stone-400">{prescription.video.title}</p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* 처방 선택 버튼 (툴팁으로 설명) */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              원하는 처방 선택
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => loadPrescription('피식')}
                title="자존심 상하는 개그 한줄 보고 마음 풀기"
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  prescription?.type === '피식' ? 'bg-teal-500 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                } ${loading ? 'opacity-50' : ''}`}
              >
                😆 피식
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => loadPrescription('냥냥')}
                title="힐링되는 강아지, 고양이 영상보고 마음 녹히기"
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  prescription?.type === '냥냥' ? 'bg-teal-500 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                } ${loading ? 'opacity-50' : ''}`}
              >
                🐾 냥냥
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => loadPrescription('맞아')}
                title="같이 공감해주는 봇의 멘트 보고 힘내기"
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  prescription?.type === '맞아' ? 'bg-teal-500 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                } ${loading ? 'opacity-50' : ''}`}
              >
                💪 맞아
              </button>
            </div>
          </div>

          {/* 하단 */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <button onClick={reset} className="text-stone-400 underline underline-offset-4 hover:text-teal-500">
              다시 기록하기
            </button>
            <button onClick={() => setStep('history')} className="text-stone-400 underline underline-offset-4 hover:text-teal-500">
              기록 내역보기
            </button>
          </div>
        </div>
      )}

      {/* ── 기록 내역 ── */}
      {step === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-700">기록 내역</h3>
            <button onClick={reset} className="text-xs text-stone-400 underline underline-offset-4 hover:text-teal-500">
              다시 기록하기
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-stone-400">아직 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const colors = getStressColor(item.stress);
                return (
                  <div key={item.id} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between text-xs text-stone-400">
                      <span>{item.createdAt}</span>
                      <span className={`font-medium ${colors.text}`}>{item.level} {item.stress}%</span>
                    </div>
                    <p className="whitespace-pre-line text-sm text-stone-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MindLogWidget;
