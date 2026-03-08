'use client';

import { useEffect, useState } from 'react';
import { getTheme } from '@/app/actions';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  textMutedColor: string;
  borderRadius: string;
  fontFamily: string;
}

export default function DynamicThemeProvider() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    async function fetchTheme() {
      const activeTheme = await getTheme();
      if (activeTheme) {
        setTheme(activeTheme as any); // Cast for now, ensures type safety overlap
      }
    }
    fetchTheme();
  }, []);

  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--background', theme.backgroundColor);
    root.style.setProperty('--text-main', theme.textColor);
    root.style.setProperty('--text-muted', theme.textMutedColor);
    root.style.setProperty('--radius', theme.borderRadius);

    // Font family logic (simplified map)
    const fontMap: Record<string, string> = {
      SANS: 'var(--font-geist-sans), ui-sans-serif, system-ui',
      SERIF: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      MONO: 'var(--font-geist-mono), ui-monospace, SFMono-Regular',
      HANDWRITING: 'var(--font-dancing), cursive',
    };

    if (theme.fontFamily && fontMap[theme.fontFamily]) {
      document.body.style.fontFamily = fontMap[theme.fontFamily];
    } else {
      document.body.style.fontFamily = fontMap['SANS'];
    }
  }, [theme]);

  // Render nothing visually, just handles side effects
  return null;
}
