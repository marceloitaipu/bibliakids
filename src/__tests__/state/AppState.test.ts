import { shuffle, isLevelUnlocked, calculateStars } from '../../state/utils';

describe('AppState utilities', () => {
  describe('shuffle', () => {
    it('should return array with same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled).toHaveLength(arr.length);
    });

    it('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      arr.forEach((item) => {
        expect(shuffled).toContain(item);
      });
    });

    it('should not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });

    it('should handle empty array', () => {
      const arr: number[] = [];
      const shuffled = shuffle(arr);
      expect(shuffled).toEqual([]);
    });

    it('should handle single element array', () => {
      const arr = [1];
      const shuffled = shuffle(arr);
      expect(shuffled).toEqual([1]);
    });
  });

  describe('isLevelUnlocked', () => {
    it('should return true for first level', () => {
      const starsByLevel = {};
      expect(isLevelUnlocked('criacao', starsByLevel)).toBe(true);
    });

    it('should return true for second level if first has stars', () => {
      const starsByLevel = { criacao: 2 };
      expect(isLevelUnlocked('noe', starsByLevel)).toBe(true);
    });

    it('should return false for second level if first has no stars', () => {
      const starsByLevel = {};
      expect(isLevelUnlocked('noe', starsByLevel)).toBe(false);
    });

    it('should return true for level with completed previous level', () => {
      const starsByLevel = { criacao: 1, noe: 3 };
      expect(isLevelUnlocked('davi', starsByLevel)).toBe(true);
    });
  });

  describe('calculateStars', () => {
    it('should return 3 stars for 90% or more correct', () => {
      expect(calculateStars(9, 10)).toBe(3);
      expect(calculateStars(10, 10)).toBe(3);
    });

    it('should return 2 stars for 60-89% correct', () => {
      expect(calculateStars(6, 10)).toBe(2);
      expect(calculateStars(8, 10)).toBe(2);
    });

    it('should return 1 star for less than 60% correct', () => {
      expect(calculateStars(5, 10)).toBe(1);
      expect(calculateStars(1, 10)).toBe(1);
    });

    it('should return 0 for empty quiz', () => {
      expect(calculateStars(0, 0)).toBe(0);
    });
  });
});
