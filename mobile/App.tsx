import {
  NavigationContainer,
  DefaultTheme,
  useNavigation,
} from "@react-navigation/native";
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
import {
  createBottomTabNavigator,
  type BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import {
  Bluetooth,
  BookOpen,
  Compass,
  LayoutDashboard,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { EntryScreen } from "./android-ui/screens/EntryScreen";
import { LogbookScreen } from "./android-ui/screens/LogbookScreen";
import { OverviewScreen } from "./android-ui/screens/OverviewScreen";
import { PlannerScreen } from "./android-ui/screens/PlannerScreen";
import { PresetsScreen } from "./android-ui/screens/PresetsScreen";
import { colors } from "./android-ui/styles/tokens";

type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Entry: undefined;
  Presets: undefined;
};
type TabParamList = {
  Overview: undefined;
  Logbook: undefined;
  Connect: undefined;
  Planner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        gap: 10,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: "700" }}>
        {title}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 15 }}>
        This workspace is ready for the next feature.
      </Text>
      <View
        style={{
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 6,
          padding: 14,
        }}
      >
        <Text style={{ color: colors.muted }}>
          Available in a future update.
        </Text>
      </View>
    </View>
  );
}

type LogbookNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Logbook">,
  NativeStackNavigationProp<RootStackParamList>
>;

type OverviewNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Overview">,
  NativeStackNavigationProp<RootStackParamList>
>;

function OverviewTabScreen() {
  const navigation = useNavigation<OverviewNavigationProp>();
  return (
    <OverviewScreen
      onNewDive={() => navigation.navigate("Entry")}
      onLogbook={() => navigation.navigate("Logbook")}
    />
  );
}

function LogbookTabScreen() {
  const navigation = useNavigation<LogbookNavigationProp>();
  return (
    <LogbookScreen
      onNewDive={() => navigation.navigate("Entry")}
      onPresets={() => navigation.navigate("Presets")}
    />
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const Icon =
            route.name === "Overview"
              ? LayoutDashboard
              : route.name === "Logbook"
                ? BookOpen
                : route.name === "Connect"
                  ? Bluetooth
                  : Compass;
          return <Icon color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="Overview" component={OverviewTabScreen} />
      <Tabs.Screen name="Logbook" component={LogbookTabScreen} />
      <Tabs.Screen
        name="Connect"
        children={() => <PlaceholderScreen title="Connect hardware" />}
      />
      <Tabs.Screen name="Planner" component={PlannerScreen} options={{ title: "Dive Planner" }} />
    </Tabs.Navigator>
  );
}

function AppShell() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Entry">
        {({ navigation }) => (
          <EntryScreen
            onSaved={() =>
              navigation.navigate("MainTabs", { screen: "Logbook" })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Presets">
        {({ navigation }) => (
          <PresetsScreen
            onBack={() =>
              navigation.navigate("MainTabs", { screen: "Logbook" })
            }
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <AppShell />
    </NavigationContainer>
  );
}
