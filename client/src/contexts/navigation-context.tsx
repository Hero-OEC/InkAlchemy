import { useLocation } from 'wouter';

// Simple navigation history using session storage
const HISTORY_KEY = 'sf_nav_history';

// Define main pages that should be tracked in navigation history
const MAIN_PAGES = [
  'dashboard',
  'characters', 
  'locations',
  'timeline',
  'magic-systems',
  'lore',
  'notes'
];

export function useNavigation() {
  const [, setLocation] = useLocation();

  const updateHistory = (currentPath: string) => {
    try {
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      
      // Only track meaningful navigation changes
      // Don't add the same path consecutively or track detail pages
      const segments = currentPath.split('/').filter(Boolean);
      const isMainPage = segments.length === 3 && segments[0] === 'projects' && MAIN_PAGES.includes(segments[2]);
      const isWelcomePage = segments.length === 0 || currentPath === '/';
      
      // Only track main pages and welcome page, not detail pages
      if ((isMainPage || isWelcomePage) && history[history.length - 1] !== currentPath) {
        history.push(currentPath);
        
        // Keep history manageable (last 5 entries for main pages only)
        if (history.length > 5) {
          history.splice(0, history.length - 5);
        }
        
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.warn('Error updating navigation history:', error);
    }
  };

  const goBack = () => {
    try {
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      const currentPath = window.location.pathname;
      const segments = currentPath.split('/').filter(Boolean);
      
      // For detail pages, determine the appropriate main page to go back to
      if (segments.length >= 3 && segments[0] === 'projects') {
        const projectId = segments[1];
        const section = segments[2];
        
        // If we're on a detail page, go back to the appropriate main page
        if (segments.length > 3) {
          // Map detail pages to their main pages
          if (section === 'characters' || section === 'events' || section === 'locations' || 
              section === 'magic-systems' || section === 'lore' || section === 'notes' ||
              section === 'spells' || section === 'abilities') {
            
            // Determine the correct main page
            let mainPage = section;
            if (section === 'events') mainPage = 'timeline';
            if (section === 'spells' || section === 'abilities') mainPage = 'magic-systems';
            
            setLocation(`/projects/${projectId}/${mainPage}`);
            return;
          }
        }
      }
      
      // For main pages, use history if available
      if (history.length > 1) {
        // Remove current page and get previous
        const filteredHistory = history.filter(path => path !== currentPath);
        const previousPath = filteredHistory[filteredHistory.length - 1];
        
        if (previousPath) {
          // Update session storage
          sessionStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
          setLocation(previousPath);
          return;
        }
      }
      
      // Fallback logic
      if (segments.length >= 2 && segments[0] === 'projects') {
        const projectId = segments[1];
        
        if (segments.length === 2) {
          setLocation('/');
        } else if (segments.length >= 3) {
          setLocation(`/projects/${projectId}/dashboard`);
        }
      } else {
        setLocation('/');
      }
    } catch (error) {
      console.warn('Error in navigation goBack:', error);
      // Ultimate fallback
      setLocation('/');
    }
  };

  return { goBack, updateHistory };
}