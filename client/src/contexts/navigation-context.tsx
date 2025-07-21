import { useLocation } from 'wouter';

const HISTORY_KEY = 'sf_nav_history';

export function useNavigation() {
  const [, setLocation] = useLocation();

  const updateHistory = (currentPath: string) => {
    try {
      // Get current history
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      
      // Parse current path
      const segments = currentPath.split('/').filter(Boolean);
      
      // Only track main pages (exactly 3 segments: /projects/1/characters)
      const isMainPage = segments.length === 3 && segments[0] === 'projects';
      const isWelcomePage = segments.length === 0 || currentPath === '/';
      
      if ((isMainPage || isWelcomePage) && history[history.length - 1] !== currentPath) {
        history.push(currentPath);
        
        // Keep only last 3 entries
        if (history.length > 3) {
          history.splice(0, history.length - 3);
        }
        
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        console.log('Navigation history updated:', history);
      }
    } catch (error) {
      console.warn('Navigation history update error:', error);
    }
  };

  const goBack = () => {
    try {
      const currentPath = window.location.pathname;
      const segments = currentPath.split('/').filter(Boolean);
      
      console.log('Going back from:', currentPath);
      
      // If on a detail page (4+ segments), go back to its main page
      if (segments.length > 3 && segments[0] === 'projects') {
        const projectId = segments[1];
        const section = segments[2];
        
        // Map sections to their main pages
        let mainPage = section;
        if (section === 'events') mainPage = 'timeline';
        if (section === 'spells' || section === 'abilities') mainPage = 'magic-systems';
        
        const targetPath = `/projects/${projectId}/${mainPage}`;
        console.log('Detail page - going to main page:', targetPath);
        setLocation(targetPath);
        return;
      }
      
      // If on a main page, check history
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      console.log('Current history:', history);
      
      // Remove current path from history and get the previous one
      const filteredHistory = history.filter((path: string) => path !== currentPath);
      const previousPath = filteredHistory[filteredHistory.length - 1];
      
      if (previousPath && filteredHistory.length > 0) {
        // Update history without current path
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
        console.log('Using history - going to:', previousPath);
        setLocation(previousPath);
        return;
      }
      
      // Fallback to dashboard or home
      if (segments.length >= 2 && segments[0] === 'projects') {
        const fallback = `/projects/${segments[1]}/dashboard`;
        console.log('Fallback to dashboard:', fallback);
        setLocation(fallback);
      } else {
        console.log('Fallback to home');
        setLocation('/');
      }
      
    } catch (error) {
      console.error('Navigation error:', error);
      setLocation('/');
    }
  };

  return { goBack, updateHistory };
}