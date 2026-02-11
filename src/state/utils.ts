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
 * Verifica TODOS os níveis anteriores, não apenas o imediatamente anterior
 */
export function isLevelUnlocked(levelId: string, starsByLevel: Record<string, number>): boolean {
  const idx = levels.levels.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true; // Primeiro nível sempre desbloqueado
  
  // Verificar se TODOS os níveis anteriores foram completados
  for (let i = 0; i < idx; i++) {
    const prevId = levels.levels[i].id;
    if ((starsByLevel[prevId] ?? 0) === 0) {
      return false;
    }
  }
  return true;
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
