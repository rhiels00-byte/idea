const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const parseJson = (text) => {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

const postGemini = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key');
  }

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini response was empty');
  }

  return parseJson(text);
};

const avatarByLevel = {
  초등: '🦖',
  중등: '🐉',
  고등: '👹',
};

const detectOps = (topic) => {
  const ops = [];
  if (/덧셈|더하기/.test(topic)) ops.push('add');
  if (/뺄셈|빼기/.test(topic)) ops.push('sub');
  if (/곱셈|곱하기/.test(topic)) ops.push('mul');
  if (/나눗셈|나누기/.test(topic)) ops.push('div');
  return ops;
};

const levelRange = (level) => {
  if (level === '고등') return { add: [50, 200], mul: [10, 30], div: [5, 15] };
  if (level === '중등') return { add: [10, 100], mul: [5, 15], div: [3, 12] };
  return { add: [1, 20], mul: [2, 9], div: [2, 9] };
};

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const makeCalcQuestion = (op, level, idx) => {
  const r = levelRange(level);
  let a, b, correct, prompt, label;

  switch (op) {
    case 'add': {
      a = randInt(r.add[0], r.add[1]);
      b = randInt(r.add[0], r.add[1]);
      correct = a + b;
      prompt = `${a} + ${b}의 값은?`;
      label = '덧셈';
      break;
    }
    case 'sub': {
      a = randInt(r.add[0], r.add[1]);
      b = randInt(r.add[0], Math.min(a, r.add[1]));
      correct = a - b;
      prompt = `${a} - ${b}의 값은?`;
      label = '뺄셈';
      break;
    }
    case 'mul': {
      a = randInt(r.mul[0], r.mul[1]);
      b = randInt(r.mul[0], r.mul[1]);
      correct = a * b;
      prompt = `${a} × ${b}의 값은?`;
      label = '곱셈';
      break;
    }
    case 'div': {
      b = randInt(r.div[0], r.div[1]);
      correct = randInt(r.div[0], r.div[1]);
      a = b * correct;
      prompt = `${a} ÷ ${b}의 값은?`;
      label = '나눗셈';
      break;
    }
    default: {
      a = randInt(2, 10);
      b = randInt(2, 10);
      correct = a + b;
      prompt = `${a} + ${b}의 값은?`;
      label = '덧셈';
    }
  }

  const answerIndex = idx % 4;
  const distractors = [correct + 1, Math.max(correct - 1, 0), correct + 2, correct - 2].filter(
    (v) => v !== correct && v >= 0,
  );
  const options = Array(4).fill(null);
  options[answerIndex] = `${correct}`;
  let di = 0;
  for (let i = 0; i < 4; i++) {
    if (options[i] === null) {
      options[i] = `${distractors[di] ?? correct + di + 3}`;
      di++;
    }
  }

  return {
    id: `q-${idx + 1}`,
    prompt,
    options,
    answerIndex,
    answerText: `${correct}`,
    explanation: `${label} 계산: ${prompt.replace('의 값은?', '')} = ${correct}`,
  };
};

export const buildFallbackQuiz = (config) => {
  const count = Number(config.qCount) || 5;
  const subject = config.subject.trim() || '일반 학습';
  const topic = config.topic.trim() || subject;
  const levelLabel = `${config.level} ${config.grade}학년`;
  const classLabel = config.classroom.trim() ? `${config.classroom} ` : '';

  const ops = detectOps(topic);
  const isArithmetic = ops.length > 0;

  return {
    boss: {
      name: `${topic} 선생님`,
      title: `${classLabel}${levelLabel} 학습 레이드`,
      avatar: avatarByLevel[config.level] || '😈',
      summary: `${subject}의 ${topic} 핵심 개념을 시험하는 선생님입니다.`,
      weakness: '정확한 개념 이해와 빠른 판단',
      attackLabel: '개념 붕괴 파동',
    },
    questions: Array.from({ length: count }, (_, idx) => {
      if (isArithmetic) {
        const op = ops[idx % ops.length];
        return makeCalcQuestion(op, config.level, idx);
      }

      const answerIndex = idx % 4;
      return {
        id: `q-${idx + 1}`,
        prompt: `다음 중 ${topic}에 대한 설명으로 올바른 것은? (${idx + 1}번)`,
        options: [
          `${topic}의 핵심 원리를 정확히 설명한 것`,
          `${topic}와 관련 없는 내용`,
          `${topic}에 대한 흔한 오해`,
          `${topic}의 반대 개념`,
        ],
        answerIndex,
        answerText: ['1번', '2번', '3번', '4번'][answerIndex],
        explanation: `${topic}의 기본 개념을 바르게 이해하는 문제입니다.`,
      };
    }),
  };
};

export const generateQuiz = async (config) => {
  const prompt = `
너는 한국 학교 수업용 퀴즈를 만드는 선생님 보조 AI다.
다음 조건에 맞춰 boss와 questions를 JSON으로만 반환해라.
boss의 name은 "선생님"이라는 단어를 포함해야 하고, 보스 대신 선생님이라는 표현을 사용해라.

- 학교급: ${config.level}
- 학급: ${config.classroom}
- 학년: ${config.grade}
- 과목: ${config.subject}
- 핵심 주제/키워드: ${config.topic}
- 문항 수: ${config.qCount}

반드시 아래 형식만 반환:
{
  "boss": {
    "name": "string",
    "title": "string",
    "avatar": "emoji one",
    "summary": "string",
    "weakness": "string",
    "attackLabel": "string"
  },
  "questions": [
    {
      "id": "q-1",
      "prompt": "문항",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "answerIndex": 0,
      "answerText": "정답 보기 그대로",
      "explanation": "정답 해설"
    }
  ]
}

조건:
- 실제 수업에서 바로 쓸 수 있는 자연스러운 4지선다형 문제를 만든다.
- 학생 수준에 맞는 난이도로 만든다.
- 핵심 주제/키워드가 "덧셈과 뺄셈" 같은 계산형이면 실제 숫자가 들어간 계산 문제를 만든다.
- 중복 문항을 만들지 않는다.
- answerIndex는 0~3 정수다.
- 모든 문항은 한국어로 작성한다.
`;

  try {
    const data = await postGemini(prompt);
    if (!Array.isArray(data.questions) || !data.questions.length) {
      throw new Error('Invalid quiz payload');
    }
    return data;
  } catch {
    return buildFallbackQuiz(config);
  }
};

export const buildFallbackRewards = (rankings) =>
  rankings.map((player, index) => ({
    studentId: player.id,
    title:
      index === 0 ? '선생님 브레이커' : index === 1 ? '정밀 타격수' : index === 2 ? '개념 추적자' : '협동 전사',
    badge:
      index === 0 ? '👑' : index === 1 ? '🎯' : index === 2 ? '⚡' : '🛡️',
    summary: `${player.name} 학생은 총 ${player.totalDamage}의 데미지를 기록하며 팀 기여를 보여주었습니다.`,
  }));

export const generateRewards = async ({ config, rankings }) => {
  const prompt = `
너는 수업 게임 종료 후 학생에게 줄 칭호와 배지를 만드는 AI다.
다음 학생 랭킹 정보를 바탕으로 JSON 배열만 반환해라.

수업 정보:
- 학교급: ${config.level}
- 학급: ${config.classroom}
- 학년: ${config.grade}
- 과목: ${config.subject}
- 주제: ${config.topic}

학생 랭킹:
${JSON.stringify(
  rankings.map((player, index) => ({
    rank: index + 1,
    studentId: player.id,
    name: player.name,
    totalDamage: player.totalDamage,
    correctCount: player.correctCount,
    accuracy: player.accuracy,
  })),
  null,
  2
)}

반환 형식:
[
  {
    "studentId": "string",
    "title": "짧은 칭호",
    "badge": "emoji one",
    "summary": "기여도 요약"
  }
]

조건:
- 각 학생에게 서로 다른 칭호를 준다.
- 칭호는 긍정적이고 게임다운 분위기여야 한다.
- summary는 교실에서 바로 읽어줄 수 있게 1문장으로 작성한다.
`;

  try {
    const data = await postGemini(prompt);
    if (!Array.isArray(data) || !data.length) {
      throw new Error('Invalid rewards payload');
    }
    return data;
  } catch {
    return buildFallbackRewards(rankings);
  }
};
