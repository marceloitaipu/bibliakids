import React from 'react';
import { View, Text, Switch } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Parents'>;

export default function ParentScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card style={{ gap: 10 }}>
        <Text style={theme.typography.title}>Para Pais</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
          Ajustes simples do jogo:
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={theme.typography.subtitle}>Modo aleatório</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
              Embaralha as perguntas toda vez que a criança joga a fase.
            </Text>
          </View>
          <Switch
            value={state.settings.shuffleQuestions}
            onValueChange={(v) => dispatch({ type: 'SET_SETTING', key: 'shuffleQuestions', value: v })}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={theme.typography.subtitle}>Narração (voz)</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
              Usa a voz do próprio aparelho (TTS). Funciona offline na maioria dos celulares.
            </Text>
          </View>
          <Switch
            value={state.settings.narration}
            onValueChange={(v) => dispatch({ type: 'SET_SETTING', key: 'narration', value: v })}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={theme.typography.subtitle}>Som (efeitos)</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
              Sons curtinhos de acerto e erro (offline).
            </Text>
          </View>
          <Switch
            value={state.settings.sound}
            onValueChange={(v) => dispatch({ type: 'SET_SETTING', key: 'sound', value: v })}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={theme.typography.subtitle}>Música de fundo</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
              Música bem baixinha por fase (offline).
            </Text>
          </View>
          <Switch
            value={state.settings.music}
            onValueChange={(v) => dispatch({ type: 'SET_SETTING', key: 'music', value: v })}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={theme.typography.subtitle}>Animações</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
              Animações leves (estrelas/celebração). Pode desligar para aparelhos fracos.
            </Text>
          </View>
          <Switch
            value={state.settings.animations}
            onValueChange={(v) => dispatch({ type: 'SET_SETTING', key: 'animations', value: v })}
          />
        </View>

        <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 10 }}>
          Este app evita pressão: sem ranking público, sem tempo correndo, mensagens sempre positivas.
        </Text>
      </Card>

      <PrimaryButton title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
}
