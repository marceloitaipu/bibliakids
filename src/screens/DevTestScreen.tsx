import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { theme } from '../theme';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'DevTest'>;

const MINIGAMES = [
  { id: 'criacao', title: '🌍 A Criação', game: 'creation_place', desc: 'Quiz Relâmpago' },
  { id: 'noe', title: '🚢 Arca de Noé', game: 'noe_pairs', desc: 'Jogo da Memória' },
  { id: 'davi', title: '🏹 Davi e Golias', game: 'david_stone', desc: 'Mira no Alvo' },
  { id: 'daniel', title: '🦁 Daniel', game: 'daniel_shields', desc: 'Reflexo Rápido' },
  { id: 'jonas', title: '🐋 Jonas', game: 'jonah_guide', desc: 'Fuja das Tempestades' },
  { id: 'jesus_nascimento', title: '⭐ Nascimento de Jesus', game: 'star_path', desc: 'Siga a Estrela' },
  { id: 'parabolas', title: '🌱 Parábolas', game: 'parables_seed', desc: 'Semeador' },
];

export default function DevTestScreen({ navigation }: Props) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
        <Card style={{ gap: 8 }}>
          <Text style={theme.typography.title}>🧪 Modo de Teste</Text>
          <Text style={{ ...theme.typography.body, color: theme.colors.muted }}>
            Escolha um mini-jogo para testar diretamente, sem passar pelo fluxo completo.
          </Text>
        </Card>

        <Text style={{ ...theme.typography.subtitle, marginTop: 8 }}>Mini-jogos:</Text>
        
        {MINIGAMES.map((mg) => (
          <Pressable 
            key={mg.id} 
            onPress={() => navigation.navigate('MiniGame', { levelId: mg.id })}
          >
            <Card style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 12,
              borderColor: theme.colors.primary2,
              borderWidth: 2,
            }}>
              <Text style={{ fontSize: 32 }}>{mg.title.split(' ')[0]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={theme.typography.subtitle}>{mg.title.slice(2)}</Text>
                <Text style={{ ...theme.typography.small, color: theme.colors.muted }}>{mg.desc}</Text>
              </View>
              <Text style={{ fontSize: 20 }}>▶️</Text>
            </Card>
          </Pressable>
        ))}

        <Text style={{ ...theme.typography.subtitle, marginTop: 16 }}>Telas:</Text>
        
        <PrimaryButton 
          title="📚 Quiz (Criação)" 
          onPress={() => navigation.navigate('Quiz', { levelId: 'criacao' })} 
        />
        <PrimaryButton 
          title="🏆 Recompensa (3 estrelas)" 
          onPress={() => navigation.navigate('Reward', { levelId: 'criacao', stars: 3, newStickerId: 'sticker_sun' })} 
          variant="success"
        />
        <PrimaryButton 
          title="🗺️ Voltar ao Mapa" 
          onPress={() => navigation.navigate('Map')} 
          variant="accent"
        />
      </View>
    </ScrollView>
  );
}
