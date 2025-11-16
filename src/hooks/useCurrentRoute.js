import { useLocation } from 'react-router-dom';

/**
 * Hook to detect if we're currently on the song page
 */
export const useCurrentRoute = () => {
  const location = useLocation();

  const isSongPage = location.pathname === '/song' || location.pathname === '/song/';
  const isHomePage = location.pathname === '/' || location.pathname === '';

  return {
    isSongPage,
    isHomePage,
    currentPath: location.pathname
  };
};

export default useCurrentRoute;