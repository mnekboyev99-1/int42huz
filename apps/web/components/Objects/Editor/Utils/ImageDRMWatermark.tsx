import React from 'react';
import { useLHSession } from '@components/Contexts/LHSessionContext';

export default function ImageDRMWatermark() {
  const session = useLHSession() as any;
  const userName = session?.data?.user?.name || 'Unknown User';
  const userEmail = session?.data?.user?.email || 'unknown@example.com';
  const userId = btoa(userEmail).slice(0, 10);

  return (
    <div
      className="pointer-events-none absolute inset-0 select-none overflow-hidden flex flex-col justify-around items-center"
      style={{
        opacity: 0.03, // Yoki 0.02 qilib yanada ko'rinmas qilish mumkin
        mixBlendMode: 'overlay', // Contrast yoki saturation o'zgarganda portlashi uchun
        zIndex: 50,
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rotate-[-25deg] transform text-center text-[10px] sm:text-xs font-bold tracking-widest uppercase text-black whitespace-nowrap"
        >
          <div>{userName} • {userEmail}</div>
          <div>ID: {userId} • DO NOT SHARE</div>
        </div>
      ))}
    </div>
  );
}
