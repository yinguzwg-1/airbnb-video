"use client";

import { ReactNode } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TranslationProvider } from '../contexts/TranslationContext';
import { Language } from '../i18n';

interface ClientProvidersProps {
  children: ReactNode;
  initialLanguage: Language;
  initialTheme?: 'light' | 'dark';
}

export default function ClientProviders({ 
  children, 
  initialLanguage, 
  initialTheme = 'light' 
}: ClientProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <TranslationProvider initialLanguage={initialLanguage}>
        {children}
      </TranslationProvider>
    </ThemeProvider>
  );
} 