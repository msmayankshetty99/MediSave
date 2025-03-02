import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to set the page title dynamically based on the current route
 */
const usePageTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    let pageTitle = 'MediSave';
    
    // Set specific page titles based on the current route
    switch (location.pathname) {
      case '/dashboard':
        pageTitle = 'MediSave - Dashboard';
        break;
      case '/expenses':
        pageTitle = 'MediSave - Expenses';
        break;
      case '/profile':
        pageTitle = 'MediSave - Profile';
        break;
      case '/login':
        pageTitle = 'MediSave - Login';
        break;
      case '/signup':
        pageTitle = 'MediSave - Sign Up';
        break;
      case '/reset-password':
        pageTitle = 'MediSave - Reset Password';
        break;
      default:
        pageTitle = 'MediSave';
    }
    
    // Update the document title
    document.title = pageTitle;
  }, [location]);
};

export default usePageTitle; 