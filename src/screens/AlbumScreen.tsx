import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../state/AppState';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Album'>;

export default function AlbumScreen({ navigation }: Props) {
  const { state, data } = useApp();

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
      <Card>
        <Text style={theme.typography.title}>Álbum de Adesivos</Text>
        <Text style={{ ...theme.typography.body, color: theme.colors.muted, marginTop: 6 }}>
          Ganhe 1 ou mais estrelas numa fase para coletar o adesivo!
        </Text>
      </Card>

      {data.stickers.map((s) => {
        const owned = !!state.progress.stickers[s.id];
        return (
          <Card key={s.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={theme.typography.subtitle}>{owned ? '✅ ' : '⬜ '} {s.name}</Text>
              <Text style={{ ...theme.typography.small, color: theme.colors.muted, marginTop: 4 }}>{s.desc}</Text>
            </View>
            <Text style={{ fontSize: 28 }}>{owned ? s.emoji : '❔'}</Text>
          </Card>
        );
      })}

      <PrimaryButton title="Voltar" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}
