import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SpeakButton from '../components/SpeakButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useBgm } from '../bgm/useBgm';

type Props = NativeStackScreenProps<RootStackParamList, 'Story'>;

export default function StoryScreen({ route, navigation }: Props) {
  const { data, state } = useApp();
  const level = data.levels.find((l) => l.id === route.params.levelId);
  useBgm(level?.id, state.settings.music);
  if (!level) return null;

  const storyText = `${level.title}. ${level.story.line1} ${level.story.line2}`;

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card style={{ gap: theme.spacing(1) }}>
        <Text style={theme.typography.title}>{level.title}</Text>

        <SpeakButton text={storyText} enabled={state.settings.narration} label="Ouvir historinha" />

        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{level.story.line1}</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>{level.story.line2}</Text>
      </Card>

      <PrimaryButton title="Jogar mini-jogo" onPress={() => navigation.replace('MiniGame', { levelId: level.id })} />
      <PrimaryButton title="Voltar ao mapa" onPress={() => navigation.goBack()} style={{ backgroundColor: theme.colors.accent }} />
    </View>
  );
}