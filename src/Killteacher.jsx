import { useEffect, useMemo, useState } from 'react';
import TeacherRaidScreen from './killteacher/TeacherRaidScreen';
import StudentRaidScreen from './killteacher/StudentRaidScreen';
import { useRaidSession } from './killteacher/useRaidSession';

const createSessionId = () =>
  `raid-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;

const Killteacher = () => {
  const pathname = window.location.pathname;
  const role = pathname.includes('/killteacher/student') ? 'student' : 'teacher';
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [sessionId] = useState(() => searchParams.get('session') || createSessionId());

  useEffect(() => {
    const nextUrl = new URL(window.location.href);
    if (!nextUrl.searchParams.get('session')) {
      nextUrl.searchParams.set('session', sessionId);
      window.history.replaceState({}, '', nextUrl);
    }
  }, [sessionId]);

  const raid = useRaidSession(sessionId);

  if (role === 'student') {
    return <StudentRaidScreen sessionId={sessionId} raid={raid} />;
  }

  return <TeacherRaidScreen sessionId={sessionId} raid={raid} />;
};

export default Killteacher;
