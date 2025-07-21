import { useLocation } from 'wouter';

// Simple navigation history using session storage
const HISTORY_KEY = 'sf_nav_history';

export function useNavigation() {
  const [, setLocation] = useLocation();

  const updateHistory = (currentPath: string) => {
    try {
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
      
      // Don't add the same path consecutively
      if (history[history.length - 1] !== currentPath) {
        history.push(currentPath);
        
        // Keep history manageable (last 10 entries)
        if (history.length > 10) {
          history.splice(0, history.length - 10);
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
      
      if (history.length > 0) {
        // Remove the current path and get the previous one
        history.pop();
        const previousPath = history[history.length - 1];
        
        if (previousPath) {
          // Update session storage
          sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
          setLocation(previousPath);
          return;
        }
      }
      
      // Fallback logic
      const currentPath = window.location.pathname;
      const segments = currentPath.split('/').filter(Boolean);
      
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