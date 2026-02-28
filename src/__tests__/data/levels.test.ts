/**
 * Testes da estrutura de dados levels.json.
 * Cobre: formato dos níveis, perguntas do quiz, referências bíblicas,
 * stickers, minigames config, integridade referencial.
 */
import levels from '../../data/levels.json';
import type { LevelsData, Level, Question, Sticker } from '../../data/types';

const data = levels as unknown as LevelsData;

describe('levels.json — estrutura de dados', () => {
  describe('formato geral', () => {
    it('tem array de levels', () => {
      expect(Array.isArray(data.levels)).toBe(true);
      expect(data.levels.length).toBeGreaterThan(0);
    });

    it('tem array de stickers', () => {
      expect(Array.isArray(data.stickers)).toBe(true);
      expect(data.stickers.length).toBeGreaterThan(0);
    });

    it('tem 7 níveis', () => {
      expect(data.levels).toHaveLength(7);
    });
  });

  describe('cada nível', () => {
    it.each(data.levels.map(l => l.id))('nível "%s" tem campos obrigatórios', (id) => {
      const level = data.levels.find(l => l.id === id)!;
      expect(level.id).toBeTruthy();
      expect(level.title).toBeTruthy();
      expect(level.short).toBeTruthy();
      expect(level.stickerId).toBeTruthy();
      expect(level.story).toBeDefined();
      expect(level.questions).toBeDefined();
      expect(level.minigame).toBeDefined();
    });

    it.each(data.levels.map(l => l.id))('nível "%s" tem história com line1 e line2', (id) => {
      const level = data.levels.find(l => l.id === id)!;
      expect(level.story.line1).toBeTruthy();
      expect(level.story.line2).toBeTruthy();
    });

    it.each(data.levels.map(l => l.id))('nível "%s" tem perguntas válidas', (id) => {
      const level = data.levels.find(l => l.id === id)!;
      expect(level.questions.length).toBeGreaterThanOrEqual(3);

      level.questions.forEach((q: Question, qi: number) => {
        expect(q.prompt).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(q.options.length);
        expect(q.explain).toBeTruthy();
        expect(q.ref).toBeTruthy();
      });
    });

    it.each(data.levels.map(l => l.id))('nível "%s" tem minigame config válida', (id) => {
      const level = data.levels.find(l => l.id === id)!;
      expect(level.minigame).toHaveProperty('type');
      const validTypes = [
        'creation_place', 'noe_pairs', 'david_stone',
        'daniel_shields', 'jonah_guide', 'star_path', 'parables_seed',
      ];
      expect(validTypes).toContain(level.minigame.type);
    });
  });

  describe('stickers', () => {
    it.each(data.stickers.map(s => s.id))('sticker "%s" tem campos obrigatórios', (id) => {
      const sticker = data.stickers.find(s => s.id === id)!;
      expect(sticker.id).toBeTruthy();
      expect(sticker.name).toBeTruthy();
      expect(sticker.emoji).toBeTruthy();
      expect(sticker.desc).toBeTruthy();
    });

    it('cada nível tem stickerId referenciando um sticker existente', () => {
      data.levels.forEach(level => {
        const sticker = data.stickers.find(s => s.id === level.stickerId);
        expect(sticker).toBeDefined();
      });
    });
  });

  describe('integridade referencial', () => {
    it('IDs de nível são únicos', () => {
      const ids = data.levels.map(l => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('IDs de sticker são únicos', () => {
      const ids = data.stickers.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('stickers referenciados nos níveis existem', () => {
      const stickerIds = new Set(data.stickers.map(s => s.id));
      data.levels.forEach(l => {
        expect(stickerIds.has(l.stickerId)).toBe(true);
      });
    });

    it('referências bíblicas não estão vazias', () => {
      data.levels.forEach(level => {
        level.questions.forEach(q => {
          expect(q.ref.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('perguntas — qualidade', () => {
    it('respostas corretas existem nas opções', () => {
      data.levels.forEach(level => {
        level.questions.forEach(q => {
          const correctOption = q.options[q.answerIndex];
          expect(correctOption).toBeTruthy();
        });
      });
    });

    it('opções não têm duplicatas em cada pergunta', () => {
      data.levels.forEach(level => {
        level.questions.forEach(q => {
          const uniqueOpts = new Set(q.options);
          expect(uniqueOpts.size).toBe(q.options.length);
        });
      });
    });

    it('prompts terminam com ? ou .', () => {
      data.levels.forEach(level => {
        level.questions.forEach(q => {
          const last = q.prompt.trim().slice(-1);
          expect(['?', '.', '!', ':']).toContain(last);
        });
      });
    });
  });
});
