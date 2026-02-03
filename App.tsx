import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { theme } from './src/theme';
import { AppProvider } from './src/state/AppState';

import AvatarScreen from './src/screens/AvatarScreen';
import MapScreen from './src/screens/MapScreen';
import StoryScreen from './src/screens/StoryScreen';
import MiniGameScreen from './src/screens/MiniGameScreen';
import QuizScreen from './src/screens/QuizScreen';
import RewardScreen from './src/screens/RewardScreen';
import AlbumScreen from './src/screens/AlbumScreen';
import ParentScreen from './src/screens/ParentScreen';
import DevTestScreen from './src/screens/DevTestScreen';

export type RootStackParamList = {
  Avatar: undefined;
  Map: undefined;
  Story: { levelId: string };
  MiniGame: { levelId: string };
  Quiz: { levelId: string };
  Reward: { levelId: string; stars: number; newStickerId?: string };
  Album: undefined;
  Parents: undefined;
  DevTest: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="DevTest"
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.bg },
            headerShadowVisible: false,
            headerTitleStyle: { fontSize: 18 },
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen name="DevTest" component={DevTestScreen} options={{ title: '🧪 Modo Teste' }} />
          <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Mapa de Aventuras' }} />
          <Stack.Screen name="Story" component={StoryScreen} options={{ title: 'História' }} />
          <Stack.Screen name="MiniGame" component={MiniGameScreen} options={{ title: 'Mini-jogo' }} />
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Perguntas' }} />
          <Stack.Screen name="Reward" component={RewardScreen} options={{ title: 'Parabéns!' }} />
          <Stack.Screen name="Album" component={AlbumScreen} options={{ title: 'Álbum de Adesivos' }} />
          <Stack.Screen name="Parents" component={ParentScreen} options={{ title: 'Para Pais' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
