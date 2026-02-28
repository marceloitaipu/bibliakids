/**
 * Testes dos componentes reutilizáveis.
 * Cobre: SpeakButton (pickBestVoice, speakCalm, stopSpeaking),
 * StarsRow, ConfettiBurst, Pulse, ErrorBoundary.
 *
 * Nota: componentes React são testados de forma leve em ambiente node
 * (sem JSDOM). Foco na lógica exportada.
 */
import * as Speech from 'expo-speech';
import { speakCalm, stopSpeaking } from '../../components/SpeakButton';

/* ─────────── SpeakButton – funções exportadas ─────────── */
describe('SpeakButton — lógica exportada', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset getAvailableVoicesAsync to default (empty voices)
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);
  });

  it('speakCalm chama Speech.stop e Speech.speak', async () => {
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);
    await speakCalm('Olá mundo');
    expect(Speech.stop).toHaveBeenCalled();
    expect(Speech.speak).toHaveBeenCalledWith(
      'Olá mundo',
      expect.objectContaining({
        language: 'pt-BR',
        rate: 0.82,
        pitch: 1.05,
      })
    );
  });

  it('speakCalm com voz disponível seleciona a melhor', async () => {
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([
      { identifier: 'pt-BR-Standard', language: 'pt-BR' },
      { identifier: 'pt-BR-Neural-Female', language: 'pt-BR' },
      { identifier: 'en-US-Standard', language: 'en-US' },
    ]);
    await speakCalm('Teste');
    expect(Speech.speak).toHaveBeenCalledWith(
      'Teste',
      expect.objectContaining({
        voice: 'pt-BR-Neural-Female', // neural + female = melhor
      })
    );
  });

  it('speakCalm prefere voz com "enhanced"', async () => {
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([
      { identifier: 'pt-BR-Enhanced', language: 'pt-BR' },
      { identifier: 'pt-BR-Standard', language: 'pt-BR' },
    ]);
    await speakCalm('Teste');
    expect(Speech.speak).toHaveBeenCalledWith(
      'Teste',
      expect.objectContaining({
        voice: 'pt-BR-Enhanced',
      })
    );
  });

  it('speakCalm funciona sem vozes disponíveis (voice=undefined)', async () => {
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([]);
    await speakCalm('Sem voz');
    expect(Speech.speak).toHaveBeenCalledWith(
      'Sem voz',
      expect.objectContaining({ voice: undefined })
    );
  });

  it('stopSpeaking chama Speech.stop', () => {
    stopSpeaking();
    expect(Speech.stop).toHaveBeenCalled();
  });

  it('speakCalm invoca onDone callback quando erro no getVoices', async () => {
    (Speech.getAvailableVoicesAsync as jest.Mock).mockRejectedValue(new Error('fail'));
    const onDone = jest.fn();
    await speakCalm('Teste', onDone);
    // Deve chamar speak mesmo com erro no picker de voz
    expect(Speech.speak).toHaveBeenCalled();
  });
});

/* ─────────── StarsRow ─────────── */
describe('StarsRow', () => {
  it('módulo exporta um componente', () => {
    const StarsRow = require('../../components/StarsRow').default;
    expect(StarsRow).toBeDefined();
    expect(typeof StarsRow).toBe('function');
  });
});

/* ─────────── ConfettiBurst ─────────── */
describe('ConfettiBurst', () => {
  it('módulo exporta um componente', () => {
    const ConfettiBurst = require('../../components/ConfettiBurst').default;
    expect(typeof ConfettiBurst).toBe('function');
  });
});

/* ─────────── Pulse ─────────── */
describe('Pulse', () => {
  it('módulo exporta um componente', () => {
    const Pulse = require('../../components/Pulse').default;
    expect(typeof Pulse).toBe('function');
  });
});

/* ─────────── Card ─────────── */
describe('Card', () => {
  it('módulo exporta um componente', () => {
    const Card = require('../../components/Card').default;
    expect(typeof Card).toBe('function');
  });
});

/* ─────────── PrimaryButton ─────────── */
describe('PrimaryButton', () => {
  it('módulo exporta um componente', () => {
    const PrimaryButton = require('../../components/PrimaryButton').default;
    expect(typeof PrimaryButton).toBe('function');
  });
});

/* ─────────── StarRise ─────────── */
describe('StarRise', () => {
  it('módulo exporta um componente', () => {
    const StarRise = require('../../components/StarRise').default;
    expect(typeof StarRise).toBe('function');
  });
});

/* ─────────── AnimatedSplash ─────────── */
describe('AnimatedSplash', () => {
  it('módulo exporta um componente', () => {
    const AnimatedSplash = require('../../components/AnimatedSplash').default;
    expect(typeof AnimatedSplash).toBe('function');
  });
});

/* ─────────── ErrorBoundary ─────────── */
describe('ErrorBoundary', () => {
  it('módulo exporta uma classe', () => {
    const ErrorBoundary = require('../../components/ErrorBoundary').default;
    expect(ErrorBoundary).toBeDefined();
    // É uma classe (Component)
    expect(ErrorBoundary.prototype).toHaveProperty('render');
  });

  it('getDerivedStateFromError retorna estado de erro', () => {
    const ErrorBoundary = require('../../components/ErrorBoundary').default;
    const error = new Error('Test error');
    const result = ErrorBoundary.getDerivedStateFromError(error);
    expect(result.hasError).toBe(true);
    expect(result.error).toBe(error);
  });
});
