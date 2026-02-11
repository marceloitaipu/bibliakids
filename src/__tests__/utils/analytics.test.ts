// Analytics utility tests - pure JavaScript, no React Native dependencies
import { analytics } from '../../utils/analytics';

describe('Analytics', () => {
  beforeEach(() => {
    analytics.clear();
    analytics.setEnabled(true);
  });

  describe('track', () => {
    it('should track events', () => {
      analytics.track('app_opened', { screen: 'Map' });
      const events = analytics.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('app_opened');
      expect(events[0].data?.screen).toBe('Map');
    });

    it('should not track when disabled', () => {
      analytics.setEnabled(false);
      analytics.track('app_opened');
      const events = analytics.getRecentEvents(10);
      expect(events).toHaveLength(0);
    });
  });

  describe('trackLevelStart', () => {
    it('should track level start', () => {
      analytics.trackLevelStart('criacao');
      const events = analytics.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('level_started');
      expect(events[0].data?.levelId).toBe('criacao');
    });
  });

  describe('trackLevelComplete', () => {
    it('should track level completion with stars', () => {
      analytics.trackLevelComplete('criacao', 3, 120);
      const events = analytics.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('level_completed');
      expect(events[0].data?.levelId).toBe('criacao');
      expect(events[0].data?.stars).toBe(3);
      expect(events[0].data?.timeSpent).toBe(120);
    });
  });

  describe('trackQuizComplete', () => {
    it('should track quiz completion', () => {
      analytics.trackQuizComplete('noe', 8, 10, 2);
      const events = analytics.getRecentEvents(10);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('quiz_completed');
      expect(events[0].data?.correct).toBe(8);
      expect(events[0].data?.total).toBe(10);
    });
  });

  describe('logError', () => {
    it('should log errors', () => {
      const error = new Error('Test error');
      analytics.logError(error, 'TestContext');
      const errors = analytics.getRecentErrors(10);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error');
      expect(errors[0].context).toBe('TestContext');
    });
  });

  describe('getStats', () => {
    it('should calculate stats correctly', () => {
      analytics.trackLevelComplete('criacao', 3);
      analytics.trackLevelComplete('noe', 2);
      analytics.logError(new Error('Test'));

      const stats = analytics.getStats();
      expect(stats.levelsCompleted).toBe(2);
      expect(stats.totalStars).toBe(5);
      expect(stats.totalErrors).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all events and errors', () => {
      analytics.track('app_opened');
      analytics.logError(new Error('Test'));
      analytics.clear();

      expect(analytics.getRecentEvents(10)).toHaveLength(0);
      expect(analytics.getRecentErrors(10)).toHaveLength(0);
    });
  });
});
