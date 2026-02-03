import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Avatar'>;

const skins = [
  { key: 'clara', label: '�🏻' },
  { key: 'media', label: '👶🏽' },
  { key: 'escura', label: '👶🏿' },
] as const;

const outfits = [
  { key: 'laranja', label: '🧡' },
  { key: 'azul', label: '💙' },
  { key: 'verde', label: '💚' },
  { key: 'rosa', label: '🩷' },
] as const;

export default function AvatarScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [name, setName] = useState(''); // optional
  const [skin, setSkin] = useState<typeof skins[number]['key']>('media');
  const [outfit, setOutfit] = useState<typeof outfits[number]['key']>('laranja');

  const canContinue = useMemo(() => true, []);

  return (
    <View style={{ flex: 1, padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Text style={theme.typography.title}>Vamos começar!</Text>
      <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
        Escolha seu avatar. Você pode colocar um nome também (opcional).
      </Text>

      <Card style={{ gap: theme.spacing(1.5) }}>
        <Text style={theme.typography.subtitle}>Seu nome (opcional)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Ana, João…"
          style={{
            backgroundColor: theme.colors.bg,
            borderRadius: theme.radius.md,
            padding: theme.spacing(1.25),
            borderWidth: 2,
            borderColor: theme.colors.stroke,
            fontSize: 16,
            fontWeight: '600',
          }}
        />

        <Text style={{ ...theme.typography.subtitle, marginTop: theme.spacing(1) }}>Tom de pele</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {skins.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSkin(s.key)}
              style={{
                flex: 1,
                padding: theme.spacing(1.25),
                borderRadius: theme.radius.lg,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: skin === s.key ? theme.colors.primary : theme.colors.stroke,
                backgroundColor: skin === s.key ? '#FFF1DD' : theme.colors.bg,
              }}
            >
              <Text style={{ fontSize: 26 }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ ...theme.typography.subtitle, marginTop: theme.spacing(1) }}>Roupa</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {outfits.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => setOutfit(o.key)}
              style={{
                flex: 1,
                padding: theme.spacing(1.25),
                borderRadius: theme.radius.lg,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: outfit === o.key ? theme.colors.accent : theme.colors.stroke,
                backgroundColor: outfit === o.key ? '#E7FAF7' : theme.colors.bg,
              }}
            >
              <Text style={{ fontSize: 22 }}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <PrimaryButton
        title="Ir para o mapa"
        onPress={() => {
          dispatch({ type: 'SET_AVATAR', avatar: { name: name.trim(), skin, outfit } as any });
          navigation.replace('Map');
        }}
        disabled={!canContinue}
      />
    </View>
  );
}
