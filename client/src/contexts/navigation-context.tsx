import { useLocation } from 'wouter';

const REFERRER_KEY = 'sf_referrer';

export function useNavigation() {
  const [, setLocation] = useLocation();

  // Set referrer when navigating to a detail page
  const setReferrer = (referrerPath: string) => {
    try {
      sessionStorage.setItem(REFERRER_KEY, referrerPath);
      console.log('Set referrer:', referrerPath);
    } catch (error) {
      console.warn('Error setting referrer:', error);
    }
  };

  // Navigate to a page while setting current page as referrer
  const navigateWithReferrer = (targetPath: string, currentPath: string) => {
    setReferrer(currentPath);
    setLocation(targetPath);
  };

  const goBack = () => {
    try {
      const currentPath = window.location.pathname;
      const referrer = sessionStorage.getItem(REFERRER_KEY);
      
      console.log('Going back from:', currentPath);
      console.log('Stored referrer:', referrer);
      
      if (referrer) {
        // Clear the referrer and go back
        sessionStorage.removeItem(REFERRER_KEY);
        console.log('Using referrer - going to:', referrer);
        setLocation(referrer);
        return;
      }
      
      // Fallback logic if no referrer
      const segments = currentPath.split('/').filter(Boolean);
      
      if (segments.length > 3 && segments[0] === 'projects') {
        // Detail page fallback - go to parent main page
        const projectId = segments[1];
        const section = segments[2];
        
        let mainPage = section;
        if (section === 'events') mainPage = 'timeline';
        if (section === 'spells' || section === 'abilities') mainPage = 'magic-systems';
        
        const fallback = `/projects/${projectId}/${mainPage}`;
        console.log('No referrer - fallback to main page:', fallback);
        setLocation(fallback);
        return;
      }
      
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

  // For backwards compatibility
  const updateHistory = () => {
    // No-op - we're using referrer-based navigation now
  };

  return { 
    goBack, 
    updateHistory, // keep for compatibility
    setReferrer,
    navigateWithReferrer 
  };
}