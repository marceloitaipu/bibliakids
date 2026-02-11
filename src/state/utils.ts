/**
 * Utilitários puros para o estado do app
 * Separados para facilitar testes unitários
 */

import levels from '../data/levels.json';

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Verifica se um level está desbloqueado baseado nas estrelas dos níveis anteriores
 */
export function isLevelUnlocked(levelId: string, starsByLevel: Record<string, number>): boolean {
  const idx = levels.levels.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;
  const prevId = levels.levels[idx - 1]?.id;
  if (!prevId) return true;
  const prevStars = starsByLevel[prevId] ?? 0;
  return prevStars > 0;
}

/**
 * Calcula quantidade de estrelas baseado no ratio de acertos
 */
export function calculateStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
}

/**
 * Dados dos levels
 */
export const levelsData = levels;
