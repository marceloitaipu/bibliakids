import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Album'>;

export default function AlbumScreen({ navigation }: Props) {
  const { state, data } = useApp();

  const totalStickers = data.stickers.length;
  const ownedCount = data.stickers.filter(s => !!state.progress.stickers[s.id]).length;
  const progressPct = totalStickers > 0 ? Math.round((ownedCount / totalStickers) * 100) : 0;

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
      {/* Header com progresso */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 32 }}>🎫</Text>
          <View style={{ flex: 1 }}>
            <Text style={theme.typography.title}>Álbum de Adesivos</Text>
            <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 2 }}>
              Ganhe estrelas nas fases para colecionar!
            </Text>
          </View>
        </View>
        
        {/* Barra de progresso */}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ ...theme.typography.small, fontWeight: '700', color: theme.colors.muted }}>
              Progresso da coleção
            </Text>
            <Text style={{ ...theme.typography.small, fontWeight: '900', color: theme.colors.primary }}>
              {ownedCount}/{totalStickers}
            </Text>
          </View>
          <View style={{ height: 12, backgroundColor: theme.colors.stroke, borderRadius: 6, overflow: 'hidden' }}>
            <LinearGradient
              colors={theme.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: '100%', width: `${progressPct}%`, borderRadius: 6 }}
            />
          </View>
          {ownedCount === totalStickers && (
            <Text style={{ ...theme.typography.small, color: theme.colors.ok, textAlign: 'center', fontWeight: '800' }}>
              🏆 Coleção completa! Parabéns!
            </Text>
          )}
        </View>
      </Card>

      {/* Grid de adesivos */}
      {data.stickers.map((s) => {
        const owned = !!state.progress.stickers[s.id];
        return (
          <Card 
            key={s.id} 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderColor: owned ? theme.colors.ok : theme.colors.stroke,
              borderWidth: owned ? 2.5 : 2,
              backgroundColor: owned ? '#F0FFF4' : undefined,
              opacity: owned ? 1 : 0.7,
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {owned && (
                  <View style={{
                    backgroundColor: theme.colors.ok,
                    borderRadius: 12,
                    width: 22,
                    height: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>✓</Text>
                  </View>
                )}
                <Text style={{ ...theme.typography.subtitle, color: owned ? theme.colors.text : theme.colors.muted }}>
                  {s.name}
                </Text>
              </View>
              <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 4 }}>{s.desc}</Text>
            </View>
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: owned ? theme.colors.primary2 + '20' : theme.colors.stroke,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: owned ? 30 : 24 }}>{owned ? s.emoji : '🔒'}</Text>
            </View>
          </Card>
        );
      })}

      <PrimaryButton title="🗺️ Voltar ao mapa" onPress={() => navigation.goBack()} variant="accent" />
    </ScrollView>
  );
}
