// Common Components
export { default as Footer } from './Common/Footer';
export { SafeClientWrapper } from './Common/SafeClientWrapper';
export { default as LanguageSwitcher } from './Common/LanguageSwitcher';
export { default as LoadingSpinner } from './Common/LoadingSpinner';
export { default as ThemeSwitcher } from './Common/ThemeSwitcher';
export { default as SearchBar } from './Common/SearchBar';
export { default as FilterBar } from './Media/FilterBar';
export { default as Header } from './Media/Header';
// Media Components
export { MediaGrid } from './Media/MediaGrid';
export { MediaCard } from './Media/MediaCard';
export { MediaList } from './Media/MediaList';
export { PaginationSection } from './Media/PaginationSection';
export { FilterSection } from './Media/FilterSection';
export { ComponentLoading } from './Common/LoadingSpinner';
// MediaDetail Components
export { default as MediaDetail } from './MediaDetail';
// BurryPoint Components
export { TrackerInitializer as ClientTrackerProvider } from './BurryPoint/ClientTrackerProvider';
export { default as AdvancedTracker } from './BurryPoint/AdvancedTracker';

// 常用组件的简化别名
export { MediaCard as Card } from './Media/MediaCard';
export { MediaGrid as Grid } from './Media/MediaGrid';
