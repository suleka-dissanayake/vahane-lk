import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import ThemeToggle from './src/components/ThemeToggle';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import PostAdScreen from './src/screens/PostAdScreen';
import InspectionFormScreen from './src/screens/InspectionFormScreen';
import MyAdsScreen from './src/screens/MyAdsScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PriceGuideScreen from './src/screens/PriceGuideScreen';
import ModelDetailScreen from './src/screens/ModelDetailScreen';

const Stack = createNativeStackNavigator();

function Root() {
  const { ready } = useAuth();
  const { mode, colors } = useTheme();
  const insets = useSafeAreaInsets(); // keeps every screen's bottom content above the Android navigation bar
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 5000); // intro page stays for 5 seconds
    return () => clearTimeout(t);
  }, []);
  if (!ready || splash) return <SplashScreen />;
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: colors.bg, card: colors.primary, text: '#fff', border: colors.border, primary: colors.primary } };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          contentStyle: { backgroundColor: colors.bg, paddingBottom: insets.bottom },
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => <ThemeToggle variant="header" />,
          statusBarStyle: 'light',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, statusBarStyle: mode === 'dark' ? 'light' : 'dark' }} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Vehicle Ad' }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Account' }} />
        <Stack.Screen name="PostAd" component={PostAdScreen} options={{ title: 'Post an Ad' }} />
        <Stack.Screen name="InspectionForm" component={InspectionFormScreen} options={{ title: 'Inspection Report' }} />
        <Stack.Screen name="MyAds" component={MyAdsScreen} options={{ title: 'My Ads' }} />
        <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: 'Search Results' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="PriceGuide" component={PriceGuideScreen} options={{ title: 'Price Guide' }} />
        <Stack.Screen name="ModelDetail" component={ModelDetailScreen} options={{ title: 'Model Overview' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
