import { TranslationKeys } from '../types';

export const en: TranslationKeys = {
  common: {
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    loading: 'Loading',
    error: 'Error',
    retry: 'Retry',
    prev: 'Previous',
    next: 'Next',
    page: 'Page',
    total: 'Total',
    results: 'results',
    noResults: 'No results',
    viewDetails: 'View Details',
  },

  home: {
    title: 'Movie Shelter',
    subtitle: 'Discover amazing movies and TV shows',
    welcomeTitle: 'Movie Shelter',
    welcomeSubtitle: 'Discover amazing content',
    exploreButton: '🎬 Explore Movie Shelter Now',
    autoRedirect: 'Auto redirect in',
    features: {
      content: {
        title: 'Rich Content',
        description: 'Curated movies and TV shows',
      },
      search: {
        title: 'Smart Search',
        description: 'Find your favorite content quickly',
      },
      interface: {
        title: 'Beautiful Interface',
        description: 'Modern user experience',
      },
    },
    stats: {
      movies: 'Featured Movies',
      tvShows: 'Popular Shows',
      free: 'Free to Watch',
      quality: 'HD Quality',
    },
  },

  media: {
    title: 'Movie Shelter',
    subtitle: 'Discover amazing content',
    searchPlaceholder: 'Search movies, TV shows, actors, directors...',
    filterTitle: 'Filter Options',
    clearFilters: 'Clear Filters',
    expandFilters: 'Expand Filters',
    collapseFilters: 'Collapse Filters',
    currentFilters: 'Current filters:',
    found: 'Found',
    searching: 'Searching...',
  },

  filters: {
    type: 'Type',
    genre: 'Genre',
    year: 'Year',
    rating: 'Min Rating',
    status: 'Status',
    sort: 'Sort',
    all: 'All',
    allGenres: 'All Genres',
    allYears: 'All Years',
    minRating: 'Any',
    allStatus: 'All Status',
    sortBy: 'Sort by',
    ascending: '↑',
    descending: '↓',
  },

  mediaTypes: {
    movie: 'Movie',
    tv: 'TV Show',
    all: 'All',
  },

  status: {
    released: 'Released',
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
  },

  sortOptions: {
    year: 'Year',
    rating: 'Rating',
    title: 'Title',
  },

  card: {
    director: 'Director',
    creator: 'Creator',
    cast: 'Cast',
    duration: 'Duration',
    seasons: 'Seasons',
    episodes: 'Episodes',
    minutes: 'minutes',
    imageLoadError: 'Image load failed',
  },

  noResults: {
    title: 'No content found',
    searchMessage: 'No content found containing',
    filterMessage: 'No results for current filters',
    clearButton: 'Clear All Filters',
  },

  footer: {
    title: '🎬 Movie Shelter',
    subtitle: 'Discover amazing content, enjoy watching',
    copyright: '© 2024 Movie Shelter. Data for demonstration only.',
    totalContent: 'Total Content',
    movies: 'Movies',
    tvShows: 'TV Shows',
    averageRating: 'Average Rating',
  },

  nav: {
    home: 'Home',
    movies: 'Movies',
    tvShows: 'TV Shows',
    rankings: 'Rankings',
    language: 'Language',
    theme: 'Theme',
  },

  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    switchTheme: 'Switch Theme',
    lightDescription: 'Light theme',
    darkDescription: 'Dark theme',
    systemDescription: 'Follow system setting',
  },

  upload: {
    title: 'Upload',
    dragDropText: 'Drag and drop files here',
    clickToSelect: 'Click to select files',
    supportedFormats: 'Supported file formats',
    maxFileSize: 'Max file size',
    maxFiles: 'Max files',
    files: 'Files',
    selectFiles: 'Select Files',
    uploading: 'Uploading',
    uploadSuccess: 'Upload successful',
    uploadError: 'Upload failed',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    removeFile: 'Remove file',
    fileRemoved: 'File removed',
    dragActive: 'Drop files',
    preview: 'Preview',
    fileName: 'File name',
    fileSize: 'File size',
    fileType: 'File type',
    progress: 'Progress',
    retry: 'Retry',
    errors: {
      fileTypeNotSupported: 'File type not supported',
      fileSizeExceeded: 'File size exceeded',
      maxFilesExceeded: 'Max files exceeded',
      uploadFailed: 'Upload failed',
      networkError: 'Network error',
      serverError: 'Server error',
    },
  },
}; 