import { useState, useEffect } from 'react';

const KEY = 'class-command-dark';

function getInitial(): boolean {
  const saved = localStorage.getItem(KEY);
  if (saved !== null) return saved === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(KEY, String(dark));
  }, [dark]);

  return [dark, () => setDark((d) => !d)];
}
