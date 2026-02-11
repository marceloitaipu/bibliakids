import { useEffect } from 'react';
import { analytics } from './analytics';

/**
 * Hook para acessar a instância de analytics
 */
export function useAnalytics() {
  return analytics;
}

/**
 * Hook para rastrear visualização de tela
 */
export function useTrackScreen(screenName: string) {
  useEffect(() => {
    analytics.track('app_opened', { screen: screenName });
  }, [screenName]);
}
