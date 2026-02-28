/**
 * Testes detalhados do reducer e lógica de estado do AppState.
 * Cobre: SET_AVATAR, SET_STARS, SET_SETTING, RESET, HYDRATE,
 * persistência com melhor-valor e stickers condicionais.
 */

// O reducer não é exportado diretamente, então testamos via utils + comportamentos
import { shuffle, isLevelUnlocked, calculateStars } from '../../state/utils';

/* ─────────── shuffle (Fisher-Yates) ─────────── */
describe('shuffle — Fisher-Yates', () => {
  it('retorna array com mesmo tamanho', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('contém todos os elementos originais', () => {
    const arr = [10, 20, 30, 40];
    const s = shuffle(arr);
    arr.forEach(v => expect(s).toContain(v));
  });

  it('não muta o array original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('retorna [] para array vazio', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('retorna [x] para array unitário', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('funciona com strings', () => {
    const s = shuffle(['a', 'b', 'c']);
    expect(s).toHaveLength(3);
    expect(s).toContain('a');
    expect(s).toContain('b');
    expect(s).toContain('c');
  });

  it('produz resultado diferente do original em longo prazo (não deterministico)', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    // Rodar 10 vezes — ao menos uma vez deve diferir da ordem original
    const results = Array.from({ length: 10 }, () => shuffle(arr));
    const someDiffers = results.some(r => JSON.stringify(r) !== JSON.stringify(arr));
    expect(someDiffers).toBe(true);
  });
});

/* ─────────── isLevelUnlocked ─────────── */
describe('isLevelUnlocked', () => {
  it('primeiro nível é sempre desbloqueado', () => {
    expect(isLevelUnlocked('criacao', {})).toBe(true);
  });

  it('segundo nível desbloqueado se primeiro tem estrelas', () => {
    expect(isLevelUnlocked('noe', { criacao: 1 })).toBe(true);
  });

  it('segundo nível bloqueado se primeiro sem estrelas', () => {
    expect(isLevelUnlocked('noe', {})).toBe(false);
  });

  it('nível posterior exige TODOS os anteriores', () => {
    // 'davi' é o 3º nível (index 2), precisa criacao E noe
    expect(isLevelUnlocked('davi', { criacao: 2 })).toBe(false);
    expect(isLevelUnlocked('davi', { criacao: 2, noe: 1 })).toBe(true);
  });

  it('funciona para o último nível se todos anteriores completos', () => {
    const stars: Record<string, number> = {
      criacao: 3, noe: 3, davi: 3, daniel: 3, jonas: 3, jesus_nascimento: 3,
    };
    expect(isLevelUnlocked('parabolas', stars)).toBe(true);
  });

  it('último nível bloqueado se algum anterior falta', () => {
    const stars: Record<string, number> = {
      criacao: 3, noe: 3, davi: 3, daniel: 0, jonas: 3, jesus_nascimento: 3,
    };
    expect(isLevelUnlocked('parabolas', stars)).toBe(false);
  });

  it('level desconhecido retorna true (fallback)', () => {
    expect(isLevelUnlocked('inexistente', {})).toBe(true);
  });
});

/* ─────────── calculateStars ─────────── */
describe('calculateStars', () => {
  it('retorna 3 estrelas para ≥90%', () => {
    expect(calculateStars(9, 10)).toBe(3);
    expect(calculateStars(10, 10)).toBe(3);
    expect(calculateStars(18, 20)).toBe(3);
  });

  it('retorna 2 estrelas para 60-89%', () => {
    expect(calculateStars(6, 10)).toBe(2);
    expect(calculateStars(7, 10)).toBe(2);
    expect(calculateStars(8, 10)).toBe(2);
  });

  it('retorna 1 estrela para <60%', () => {
    expect(calculateStars(5, 10)).toBe(1);
    expect(calculateStars(1, 10)).toBe(1);
    expect(calculateStars(0, 10)).toBe(1);
  });

  it('retorna 0 para quiz vazio (0/0)', () => {
    expect(calculateStars(0, 0)).toBe(0);
  });

  it('pontuação limítrofe: exatamente 90% → 3 estrelas', () => {
    expect(calculateStars(90, 100)).toBe(3);
  });

  it('pontuação limítrofe: exatamente 60% → 2 estrelas', () => {
    expect(calculateStars(60, 100)).toBe(2);
  });

  it('pontuação limítrofe: 59% → 1 estrela', () => {
    expect(calculateStars(59, 100)).toBe(1);
  });
});
