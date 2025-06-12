export type Theme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const lightTheme: ThemeConfig = {
  theme: 'light',
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: {
      primary: '#111827',
      secondary: '#374151',
      muted: '#6B7280',
    },
    border: '#E5E7EB',
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

export const darkTheme: ThemeConfig = {
  theme: 'dark',
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    background: '#0F172A',
    surface: '#1E293B',
    text: {
      primary: '#F8FAFC',
      secondary: '#E2E8F0',
      muted: '#94A3B8',
    },
    border: '#334155',
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
}; 