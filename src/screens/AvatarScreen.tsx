import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Avatar'>;

const skins = [
  { key: 'clara', label: '👶🏻', name: 'Clara' },
  { key: 'media', label: '👶🏽', name: 'Média' },
  { key: 'escura', label: '👶🏿', name: 'Escura' },
] as const;

const outfits = [
  { key: 'laranja', label: '🧡', name: 'Laranja', color: '#FF7A00' },
  { key: 'azul', label: '💙', name: 'Azul', color: '#2196F3' },
  { key: 'verde', label: '💚', name: 'Verde', color: '#4CAF50' },
  { key: 'rosa', label: '🩷', name: 'Rosa', color: '#E91E63' },
] as const;

export default function AvatarScreen({ navigation }: Props) {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [skin, setSkin] = useState<typeof skins[number]['key']>('media');
  const [outfit, setOutfit] = useState<typeof outfits[number]['key']>('laranja');

  const currentSkin = skins.find(s => s.key === skin)!;
  const currentOutfit = outfits.find(o => o.key === outfit)!;

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}
    >
      {/* Título com emoji */}
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 40 }}>📖✨</Text>
        <Text style={{ ...theme.typography.title, textAlign: 'center' }}>Aventuras da Bíblia</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, textAlign: 'center' }}>
          Crie seu personagem para começar!
        </Text>
      </View>

      {/* Preview do Avatar */}
      <LinearGradient
        colors={theme.gradients.card}
        style={{
          borderRadius: theme.radius.xl,
          padding: theme.spacing(2),
          alignItems: 'center',
          borderWidth: 3,
          borderColor: currentOutfit.color + '60',
          ...theme.shadows.medium,
        }}
      >
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: currentOutfit.color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: currentOutfit.color + '40',
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 56 }}>{currentSkin.label}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 22 }}>{currentOutfit.label}</Text>
          <Text style={{ ...theme.typography.subtitle, color: theme.colors.text }}>
            {name.trim() || 'Explorador(a)'}
          </Text>
        </View>
        <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 4 }}>
          Seu avatar está pronto!
        </Text>
      </LinearGradient>

      {/* Configurações */}
      <Card style={{ gap: theme.spacing(1.5) }}>
        <Text style={theme.typography.subtitle}>✏️ Seu nome (opcional)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Ana, João…"
          maxLength={20}
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

        <Text style={{ ...theme.typography.subtitle, marginTop: theme.spacing(1) }}>🎨 Tom de pele</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {skins.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSkin(s.key)}
              accessibilityLabel={`Tom de pele ${s.name}`}
              accessibilityState={{ selected: skin === s.key }}
              style={{
                flex: 1,
                padding: theme.spacing(1.25),
                borderRadius: theme.radius.lg,
                alignItems: 'center',
                borderWidth: skin === s.key ? 3 : 2,
                borderColor: skin === s.key ? theme.colors.primary : theme.colors.stroke,
                backgroundColor: skin === s.key ? '#FFF1DD' : theme.colors.bg,
                ...theme.shadows.small,
              }}
            >
              <Text style={{ fontSize: 30 }}>{s.label}</Text>
              <Text style={{ ...theme.typography.small, marginTop: 4, color: skin === s.key ? theme.colors.primary : theme.colors.muted }}>
                {s.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ ...theme.typography.subtitle, marginTop: theme.spacing(1) }}>👕 Roupa</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {outfits.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => setOutfit(o.key)}
              accessibilityLabel={`Roupa ${o.name}`}
              accessibilityState={{ selected: outfit === o.key }}
              style={{
                flex: 1,
                padding: theme.spacing(1.25),
                borderRadius: theme.radius.lg,
                alignItems: 'center',
                borderWidth: outfit === o.key ? 3 : 2,
                borderColor: outfit === o.key ? o.color : theme.colors.stroke,
                backgroundColor: outfit === o.key ? o.color + '15' : theme.colors.bg,
                ...theme.shadows.small,
              }}
            >
              <Text style={{ fontSize: 26 }}>{o.label}</Text>
              <Text style={{ ...theme.typography.small, marginTop: 4, color: outfit === o.key ? o.color : theme.colors.muted }}>
                {o.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <PrimaryButton
        title="🗺️ Ir para o mapa!"
        onPress={() => {
          dispatch({ type: 'SET_AVATAR', avatar: { name: name.trim(), skin, outfit } });
          navigation.replace('Map');
        }}
      />
    </ScrollView>
  );
}
