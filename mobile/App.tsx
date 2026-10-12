import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { EntryScreen } from './android-ui/screens/EntryScreen';
import { LogbookScreen } from './android-ui/screens/LogbookScreen';
import { OverviewScreen } from './android-ui/screens/OverviewScreen';
import { PlannerScreen } from './android-ui/screens/PlannerScreen';
import { colors } from './android-ui/styles/tokens';

type RootStackParamList = {
  Overview: undefined;
  Logbook: undefined;
  Entry: undefined;
  Planner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.air } };

export default function App() {
  return <NavigationContainer theme={navigationTheme}><StatusBar style="light" /><Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}><Stack.Screen name="Overview" component={OverviewScreen} /><Stack.Screen name="Logbook" component={LogbookScreen} /><Stack.Screen name="Entry" component={EntryScreen} /><Stack.Screen name="Planner" component={PlannerScreen} /></Stack.Navigator></NavigationContainer>;
}
