import { useEffect, useMemo, useRef, useState } from 'react';
import { buildFallbackRewards, generateQuiz, generateRewards } from './gemini';

const STORAGE_PREFIX = 'killteacher-session';
const CHANNEL_NAME = 'killteacher-raid-sync';

const avatars = ['🐯', '🦊', '🐼', '🦄', '🐙', '🐸', '🐧', '🐰'];
const demoStudents = [
  { name: '지우', avatar: '🐯' },
  { name: '서연', avatar: '🦊' },
  { name: '민준', avatar: '🐼' },
  { name: '하린', avatar: '🦄' },
  { name: '도윤', avatar: '🐙' },
];

const createEmptyState = (sessionId) => ({
  sessionId,
  phase: 'SETUP',
  config: {
    classroom: '',
    level: '초등',
    grade: '',
    subject: '',
    topic: '',
    qCount: 5,
  },
  boss: {
    name: '학습의 선생님',
    title: '교실 레이드',
    avatar: '🐲',
    summary: '문항을 생성하면 선생님이 깨어납니다.',
    weakness: '개념 이해',
    attackLabel: '개념 충격파',
  },
  questions: [],
  currentQuestionIndex: 0,
  bossHp: 100,
  students: [],
  logs: [],
  responses: {},
  rewards: [],
  lastAttack: null,
  lastMiss: null,
  attackCounter: 0,
  missCounter: 0,
  updatedAt: Date.now(),
});

const getStorageKey = (sessionId) => `${STORAGE_PREFIX}:${sessionId}`;

const readSession = (sessionId) => {
  const raw = window.localStorage.getItem(getStorageKey(sessionId));
  if (!raw) {
    return createEmptyState(sessionId);
  }

  try {
    return { ...createEmptyState(sessionId), ...JSON.parse(raw) };
  } catch {
    return createEmptyState(sessionId);
  }
};

const saveSession = (sessionId, nextState, channel) => {
  window.localStorage.setItem(getStorageKey(sessionId), JSON.stringify(nextState));
  channel?.postMessage(nextState);
};

const applyRanking = (state) => {
  const rankings = [...state.students]
    .map((student) => ({
      ...student,
      accuracy:
        student.attemptCount > 0
          ? Math.round((student.correctCount / student.attemptCount) * 100)
          : 0,
    }))
    .sort((a, b) => {
      if (b.totalDamage !== a.totalDamage) return b.totalDamage - a.totalDamage;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.name.localeCompare(b.name);
    });

  return {
    ...state,
    rankings,
  };
};

const finalizeState = async (state, publish) => {
  const rankedState = applyRanking({ ...state, phase: 'RESULT' });
  const fallbackRewards = buildFallbackRewards(rankedState.rankings);
  const settledState = {
    ...rankedState,
    rewards: fallbackRewards,
    updatedAt: Date.now(),
  };

  publish(settledState);

  const rewards = await generateRewards({
    config: settledState.config,
    rankings: settledState.rankings,
  });

  publish({
    ...settledState,
    rewards,
    updatedAt: Date.now(),
  });
};

export const useRaidSession = (sessionId) => {
  const channelRef = useRef(null);
  const [state, setState] = useState(() => applyRanking(readSession(sessionId)));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const onMessage = (event) => {
      const incoming = event.data;
      if (incoming?.sessionId !== sessionId) return;
      setState((prev) => (incoming.updatedAt >= prev.updatedAt ? applyRanking(incoming) : prev));
    };

    const onStorage = (event) => {
      if (event.key !== getStorageKey(sessionId) || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue);
        setState((prev) => (incoming.updatedAt >= prev.updatedAt ? applyRanking(incoming) : prev));
      } catch {
        return;
      }
    };

    channel.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);

    return () => {
      channel.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
      channel.close();
    };
  }, [sessionId]);

  const publish = (nextState) => {
    setState(applyRanking(nextState));
    saveSession(sessionId, nextState, channelRef.current);
  };

  const mutate = (updater) => {
    setState((prev) => {
      const next = applyRanking({
        ...updater(prev),
        updatedAt: Date.now(),
      });
      saveSession(sessionId, next, channelRef.current);
      return next;
    });
  };

  const updateConfig = (patch) => {
    mutate((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...patch,
      },
    }));
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const result = await generateQuiz(state.config);
      mutate((prev) => ({
        ...prev,
        phase: 'LOBBY',
        boss: result.boss,
        questions: result.questions,
        currentQuestionIndex: 0,
        bossHp: 100,
        logs: [],
        responses: {},
        rewards: [],
        lastAttack: null,
        lastMiss: null,
        attackCounter: 0,
        missCounter: 0,
        students: prev.students.map((student) => ({
          ...student,
          totalDamage: 0,
          correctCount: 0,
          attemptCount: 0,
          streak: 0,
          lastAnsweredQuestion: null,
        })),
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const joinStudent = ({ name, avatar }) => {
    const studentId = `${name.trim().toLowerCase()}-${avatar}`;
    let joinedStudent = null;

    mutate((prev) => {
      const existing = prev.students.find((student) => student.id === studentId);
      if (!existing && prev.students.length >= 5) {
        joinedStudent = null;
        return prev;
      }
      joinedStudent =
        existing ||
        {
          id: studentId,
          name: name.trim(),
          avatar,
          totalDamage: 0,
          correctCount: 0,
          attemptCount: 0,
          streak: 0,
          lastAnsweredQuestion: null,
        };

      return {
        ...prev,
        students: existing ? prev.students : [...prev.students, joinedStudent],
      };
    });

    return joinedStudent;
  };

  const fillDemoStudents = () => {
    mutate((prev) => {
      const existingIds = new Set(prev.students.map((student) => student.id));
      const nextStudents = [...prev.students];

      for (const demo of demoStudents) {
        if (nextStudents.length >= 5) break;
        const studentId = `${demo.name.trim().toLowerCase()}-${demo.avatar}`;
        if (existingIds.has(studentId)) continue;
        nextStudents.push({
          id: studentId,
          name: demo.name,
          avatar: demo.avatar,
          totalDamage: 0,
          correctCount: 0,
          attemptCount: 0,
          streak: 0,
          lastAnsweredQuestion: null,
        });
      }

      return {
        ...prev,
        students: nextStudents,
      };
    });
  };

  const startGame = () => {
    mutate((prev) => ({
      ...prev,
      phase: 'PLAY',
    }));
  };

  const nextQuestion = () => {
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= state.questions.length || state.bossHp <= 0) {
      finalizeState(state, publish);
      return;
    }

    mutate((prev) => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      lastAttack: null,
      lastMiss: null,
    }));
  };

  const submitAnswer = ({ studentId, optionIndex }) => {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) return { accepted: false, correct: false };

    const currentResponses = state.responses[question.id] || {};
    if (currentResponses[studentId] !== undefined) {
      return { accepted: false, correct: false };
    }

    const isCorrect = question.answerIndex === optionIndex;
    let shouldFinalize = false;

    mutate((prev) => {
      const activeQuestion = prev.questions[prev.currentQuestionIndex];
      if (!activeQuestion) return prev;

      const responses = prev.responses[activeQuestion.id] || {};
      if (responses[studentId] !== undefined) return prev;

      // Update student stats
      const students = prev.students.map((student) => {
        if (student.id !== studentId) return student;
        const nextStreak = isCorrect ? student.streak + 1 : 0;
        const damage = isCorrect ? 12 + Math.min(nextStreak, 4) * 3 : 0;
        return {
          ...student,
          totalDamage: student.totalDamage + damage,
          correctCount: student.correctCount + (isCorrect ? 1 : 0),
          attemptCount: student.attemptCount + 1,
          streak: nextStreak,
          lastAnsweredQuestion: activeQuestion.id,
        };
      });

      const attacker = students.find((student) => student.id === studentId);
      const damage = isCorrect ? 12 + Math.min(attacker?.streak || 0, 4) * 3 : 0;
      const nextHp = Math.max(0, prev.bossHp - damage);

      // Updated responses for this question
      const updatedQuestionResponses = { ...responses, [studentId]: optionIndex };
      const updatedResponses = {
        ...prev.responses,
        [activeQuestion.id]: updatedQuestionResponses,
      };

      // Check if all students answered this question
      const allAnswered =
        prev.students.length > 0 &&
        prev.students.every((s) => updatedQuestionResponses[s.id] !== undefined);
      const allWrong = !isCorrect && allAnswered;

      // Advance if: first correct answer OR all students answered wrong
      const shouldAdvance = isCorrect || allWrong;
      const nextIndex = shouldAdvance
        ? prev.currentQuestionIndex + 1
        : prev.currentQuestionIndex;
      shouldFinalize =
        (isCorrect && nextHp <= 0) ||
        (shouldAdvance && nextIndex >= prev.questions.length);

      const nextAttackCounter = prev.attackCounter || 0;
      const nextMissCounter = prev.missCounter || 0;

      // Build log entry
      const newLogs = [];
      if (allWrong) {
        newLogs.push({
          id: `${Date.now()}-miss`,
          name: '선생님',
          avatar: prev.boss?.avatar || '😈',
          damage: 0,
          questionId: activeQuestion.id,
          correct: false,
          text: '모든 학생이 오답! 선생님이 공격을 견뎠어요.',
        });
      }
      newLogs.push({
        id: `${Date.now()}-${studentId}`,
        name: attacker?.name || '학생',
        avatar: attacker?.avatar || '⚔️',
        damage,
        questionId: activeQuestion.id,
        correct: isCorrect,
        text: isCorrect
          ? `${attacker?.name || '학생'} 학생이 ${damage} 데미지를 입혔어요.`
          : `${attacker?.name || '학생'} 학생이 도전했지만 선생님이 버텼어요.`,
      });

      return {
        ...prev,
        students,
        bossHp: nextHp,
        currentQuestionIndex:
          shouldAdvance && !shouldFinalize ? nextIndex : prev.currentQuestionIndex,
        responses: updatedResponses,
        lastAttack: isCorrect
          ? {
              studentId,
              name: attacker?.name || '학생',
              avatar: attacker?.avatar || '⚔️',
              damage,
              counter: nextAttackCounter + 1,
            }
          : prev.lastAttack,
        lastMiss: allWrong
          ? { counter: nextMissCounter + 1 }
          : prev.lastMiss,
        attackCounter: isCorrect ? nextAttackCounter + 1 : nextAttackCounter,
        missCounter: allWrong ? nextMissCounter + 1 : nextMissCounter,
        logs: [...newLogs, ...prev.logs].slice(0, 10),
      };
    });

    if (shouldFinalize) {
      const latest = readSession(sessionId);
      finalizeState(latest, publish);
    }

    return { accepted: true, correct: isCorrect };
  };

  const resetSession = () => {
    const nextState = createEmptyState(sessionId);
    publish(nextState);
  };

  const currentQuestion = useMemo(
    () => state.questions[state.currentQuestionIndex] || null,
    [state.currentQuestionIndex, state.questions]
  );

  return {
    avatars,
    state,
    currentQuestion,
    isGenerating,
    updateConfig,
    generateQuestions,
    joinStudent,
    fillDemoStudents,
    startGame,
    nextQuestion,
    submitAnswer,
    resetSession,
  };
};
