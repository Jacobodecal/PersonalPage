'use client';

import { useEffect, useState } from 'react';

const formatTime = () =>
  new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

// Local time in São Paulo. Rendered only after mount so server and client HTML match.
export default function SaoPauloClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatTime());
    const timer = setInterval(() => setTime(formatTime()), 15_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span>
      São Paulo
      <span className="tabular-nums">{time ? ` · ${time}` : ''}</span>
    </span>
  );
}
