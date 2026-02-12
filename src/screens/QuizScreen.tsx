import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SpeakButton from '../components/SpeakButton';
import ConfettiBurst from '../components/ConfettiBurst';
import Pulse from '../components/Pulse';
import { useSfx } from '../sfx/useSfx';
import { useApp, shuffle } from '../state/AppState';
import { analytics } from '../utils/analytics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useBgm } from '../bgm/useBgm';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ route, navigation }: Props) {
  const { data, state } = useApp();
  const level = data.levels.find((l) => l.id === route.params.levelId);
  useBgm(level?.id, state.settings.music);
  const { playSuccess, playFail, playTap, playPerfect } = useSfx(state.settings.sound);

  // Embaralha as perguntas
  const questions = useMemo(() => {
    const base = level?.questions ?? [];
    return state.settings.shuffleQuestions ? shuffle(base) : base;
  }, [level?.id, state.settings.shuffleQuestions]);

  // Embaralha as opções de cada pergunta (mantendo o índice correto)
  const shuffledQuestions = useMemo(() => {
    if (!state.settings.shuffleQuestions) return questions;
    return questions.map(q => {
      const indices = q.options.map((_, i) => i);
      const shuffledIndices = shuffle(indices);
      const newOptions = shuffledIndices.map(i => q.options[i]);
      const newAnswerIndex = shuffledIndices.indexOf(q.answerIndex);
      return { ...q, options: newOptions, answerIndex: newAnswerIndex };
    });
  }, [questions, state.settings.shuffleQuestions]);

  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [burst, setBurst] = useState(false);

  const q = shuffledQuestions[i];
  const total = shuffledQuestions.length;

  const progressText = useMemo(() => `Pergunta ${i + 1} de ${total}`, [i, total]);

  const onPick = useCallback((idx: number) => {
    if (chosen !== null) return;
    playTap();
    setChosen(idx);
    const ok = idx === q?.answerIndex;

    if (ok) {
      setCorrect((c) => c + 1);
      if (wrong === 0) playPerfect();
      else playSuccess();

      if (state.settings.animations) {
        setBurst(true);
        setTimeout(() => setBurst(false), 750);
      }
    } else {
      setWrong((w) => w + 1);
      playFail();
    }
    setShowExplain(true);
  }, [chosen, q?.answerIndex, wrong, playTap, playPerfect, playSuccess, playFail, state.settings.animations]);

  const next = useCallback(() => {
    if (i + 1 >= total) {
      const lastOk = chosen === q?.answerIndex ? 1 : 0;
      const doneCorrect = correct + lastOk;

      const ratio = doneCorrect / total;
      // Garantir pelo menos 1 estrela para desbloquear próxima fase
      const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
      console.log('QuizScreen: Finalizando quiz -', { levelId: level?.id, doneCorrect, total, ratio, stars });
      
      // Analytics
      analytics.trackQuizComplete(level?.id || '', doneCorrect, total, stars);
      
      navigation.replace('Reward', { levelId: level?.id || '', stars, newStickerId: level?.stickerId });
      return;
    }
    setI((x) => x + 1);
    setChosen(null);
    setShowExplain(false);
  }, [i, total, chosen, q?.answerIndex, correct, level?.id, level?.stickerId, navigation]);

  if (!level || !q) return null;

  const options = q.options;
  const speakQuestion = `${q.prompt}. Opções: ${options.map((o, idx) => `${idx + 1}: ${o}`).join('. ')}`;
  const nextTitle = i + 1 >= total ? 'Ver recompensa' : 'Próxima';

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card>
        <Text 
          style={{ ...theme.typography.small, color: theme.colors.muted }}
          accessibilityRole="text"
        >
          {progressText}
        </Text>
        <Text 
          style={{ ...theme.typography.subtitle, marginTop: 8 }}
          accessibilityRole="header"
        >
          {q.prompt}
        </Text>
        <SpeakButton text={speakQuestion} enabled={state.settings.narration} label="Ouvir pergunta" style={{ marginTop: 12 }} />
      </Card>

      <View style={{ gap: theme.spacing(1.5) }} accessibilityRole="radiogroup">
        {options.map((opt, idx) => {
          const isChosen = chosen === idx;
          const isAnswer = idx === q.answerIndex;
          const show = chosen !== null;

          let border = theme.colors.stroke;
          let bg = theme.colors.card;
          let accessibilityState: 'correct' | 'incorrect' | undefined;

          if (show && isChosen && isAnswer) {
            border = theme.colors.ok;
            bg = '#EAF9F0';
            accessibilityState = 'correct';
          } else if (show && isChosen && !isAnswer) {
            border = theme.colors.bad;
            bg = '#FDECEC';
            accessibilityState = 'incorrect';
          } else if (show && isAnswer) {
            border = theme.colors.ok;
            bg = '#F7FFFA';
            accessibilityState = 'correct';
          }

          return (
            <Pressable 
              key={idx} 
              onPress={() => onPick(idx)} 
              disabled={chosen !== null}
              accessibilityRole="radio"
              accessibilityState={{ 
                checked: isChosen,
                disabled: chosen !== null 
              }}
              accessibilityLabel={`Opção ${idx + 1}: ${opt}${show ? (isAnswer ? ', resposta correta' : isChosen ? ', resposta incorreta' : '') : ''}`}
              accessibilityHint={chosen === null ? 'Toque para selecionar esta resposta' : undefined}
            >
              <Card style={{ borderColor: border, backgroundColor: bg }}>
                <Text style={theme.typography.body}>{opt}</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>

      {showExplain && (
        <Card style={{ gap: 8, position: 'relative', overflow: 'hidden' }}>
          <ConfettiBurst show={burst && chosen === q.answerIndex && state.settings.animations} />
          <Text 
            style={theme.typography.subtitle}
            accessibilityRole="alert"
          >
            {chosen === q.answerIndex ? 'Muito bem! ✅' : 'Quase! 🙂'}
          </Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{q.explain}</Text>
          <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>📖 {q.ref}</Text>
          <SpeakButton
            text={`${chosen === q.answerIndex ? 'Muito bem! ' : 'Quase! '} ${q.explain}`}
            enabled={state.settings.narration}
            label="Ouvir explicação"
            style={{ marginTop: 8 }}
          />
        </Card>
      )}

      <Pulse active={showExplain && state.settings.animations}>
        <PrimaryButton title={nextTitle} onPress={next} disabled={!showExplain} />
      </Pulse>
    </View>
  );
}